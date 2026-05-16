import concurrent.futures
import logging
import os
import sys
from pathlib import Path
from typing import Any

_backend_root = Path(__file__).resolve().parent.parent
if str(_backend_root) not in sys.path:
    sys.path.insert(0, str(_backend_root))
import env_config  # noqa: E402, F401

import fal_client

logger = logging.getLogger(__name__)

DEFAULT_WORKFLOW = "workflows/nsjayawardanaofficial/text2audio2video"
TTS_MODEL = "fal-ai/elevenlabs/tts/eleven-v3"
VIDEO_MODEL = "fal-ai/kling-video/ai-avatar/v2/standard"
WORKING_AVATAR_URL = (
    "https://storage.googleapis.com/falserverless/example_inputs/kling_ai_avatar_input.jpg"
)


def _env(name: str, default: str = "") -> str:
    from env_config import env

    return env(name, default)


def _fal_timeout_seconds() -> int:
    try:
        return max(120, int(_env("FAL_TIMEOUT_SECONDS", "600")))
    except ValueError:
        return 600


def _fal_mode() -> str:
    return (_env("FAL_MODE", "pipeline") or "pipeline").lower()


def _workflow_id() -> str:
    return _env("FAL_WORKFLOW", DEFAULT_WORKFLOW) or DEFAULT_WORKFLOW


def _friendly_network_error(exc: BaseException) -> str:
    msg = str(exc)
    if "getaddrinfo" in msg.lower() or "11001" in msg or "name or service not known" in msg.lower():
        return (
            "Cannot reach Fal.ai (DNS/network). Check internet connection and VPN, then retry."
        )
    return msg


def _ensure_fal_key() -> str:
    from env_config import ensure_env_loaded

    ensure_env_loaded()
    fal_key = _env("FAL_KEY")
    if not fal_key:
        raise ValueError(
            "FAL_KEY is not set in backend/.env — add FAL_KEY=your_key, save, "
            "then restart (.\\stop-backend.ps1 then .\\start-stable.ps1)."
        )
    os.environ["FAL_KEY"] = fal_key
    return fal_key


def _fal_submit(app_id: str, arguments: dict[str, Any]) -> Any:
    timeout = _fal_timeout_seconds()

    def run() -> Any:
        try:
            handler = fal_client.submit(app_id, arguments=arguments)
            return handler.get()
        except OSError as exc:
            raise OSError(_friendly_network_error(exc)) from exc

    logger.info("Fal request start: %s", app_id)
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        future = pool.submit(run)
        try:
            result = future.result(timeout=timeout)
            logger.info("Fal request done: %s", app_id)
            return result
        except concurrent.futures.TimeoutError as exc:
            raise TimeoutError(
                f"Fal timed out after {timeout}s ({app_id}). "
                "Try shorter text or increase FAL_TIMEOUT_SECONDS in backend/.env"
            ) from exc
        except OSError as exc:
            raise OSError(_friendly_network_error(exc)) from exc


def _is_workflow_not_found(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "not found" in msg or "404" in msg or "does not exist" in msg


def _is_avatar_download_error(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return "file_download_error" in msg or "failed to download the file" in msg


def _should_fallback_to_pipeline(exc: BaseException) -> bool:
    if _is_workflow_not_found(exc) or _is_avatar_download_error(exc):
        return True
    msg = str(exc).lower()
    return (
        '"status": 400' in msg
        or '"status": 422' in msg
        or "is required to be part of" in msg
        or "validation" in msg
        or "timed out" in msg
    )


def _resolve_avatar_url(preferred: str | None = None) -> str:
    """Use working public portrait — avoids expired fal.media links."""
    for raw in (preferred, _env("FAL_DEFAULT_AVATAR_URL"), WORKING_AVATAR_URL):
        url = (raw or "").strip()
        if url:
            return url
    return WORKING_AVATAR_URL


def _extract_media_urls(result: Any) -> tuple[str | None, str | None]:
    video_url: str | None = None
    audio_url: str | None = None

    def walk(node: Any) -> None:
        nonlocal video_url, audio_url
        if isinstance(node, dict):
            if not video_url and "video" in node:
                val = node["video"]
                if isinstance(val, dict) and val.get("url"):
                    video_url = val["url"]
                elif isinstance(val, str) and val.startswith("http"):
                    video_url = val
            if not audio_url and "audio" in node:
                val = node["audio"]
                if isinstance(val, dict) and val.get("url"):
                    audio_url = val["url"]
                elif isinstance(val, str) and val.startswith("http"):
                    audio_url = val
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(result)
    return video_url, audio_url


def _run_custom_workflow(
    prompt: str,
    *,
    voice: str,
    avatar_url: str,
    video_prompt: str,
    stability: float,
    timestamps: bool,
    language_code_iso: str,
    apply_text_normalization: str,
) -> dict[str, str | None]:
    arguments: dict[str, Any] = {
        "prompt": prompt[:8000],
        "voice": voice or "",
        "stability": stability,
        "timestamps": timestamps,
        "language_code_iso": language_code_iso or _env("FAL_LANGUAGE_CODE_ISO", ""),
        "apply_text_normalization": apply_text_normalization or "auto",
        "avatar": avatar_url,
        "video_prompt": video_prompt or "",
    }
    workflow = _workflow_id()
    result = _fal_submit(workflow, arguments)
    video_url, audio_url = _extract_media_urls(result)
    if not video_url and not audio_url:
        keys = list(result.keys()) if isinstance(result, dict) else str(type(result))
        raise ValueError(f"Workflow returned no media URLs. Keys: {keys}")
    return {"video_url": video_url, "audio_url": audio_url, "source": workflow}


def _max_script_chars() -> int:
    try:
        return max(500, int(_env("FAL_MAX_SCRIPT_CHARS", "2500")))
    except ValueError:
        return 2500


def _run_public_pipeline(
    prompt: str,
    *,
    voice: str,
    avatar_url: str,
    video_prompt: str,
    apply_text_normalization: str,
    on_audio_ready=None,
) -> dict[str, str | None]:
    """TTS (ElevenLabs) → avatar video (Kling). Reliable with any Fal API key."""
    tts_model = _env("FAL_TTS_MODEL", TTS_MODEL)
    video_model = _env("FAL_VIDEO_MODEL", VIDEO_MODEL)
    text = prompt[: _max_script_chars()]

    logger.info("Step 1/2: generating speech (%s)", tts_model)
    tts_args: dict[str, Any] = {
        "text": text,
        "voice": voice or "Rachel",
        "apply_text_normalization": apply_text_normalization or "auto",
    }
    tts_result = _fal_submit(tts_model, tts_args)
    _, audio_url = _extract_media_urls(tts_result)
    if not audio_url and isinstance(tts_result, dict):
        audio = tts_result.get("audio")
        if isinstance(audio, dict):
            audio_url = audio.get("url")
    if not audio_url:
        raise ValueError(
            f"TTS returned no audio. Keys: {list(tts_result.keys()) if isinstance(tts_result, dict) else tts_result}"
        )

    if on_audio_ready:
        on_audio_ready(audio_url)

    logger.info("Step 2/2: generating video (%s)", video_model)
    video_args: dict[str, Any] = {
        "image_url": avatar_url,
        "audio_url": audio_url,
        "prompt": video_prompt or ".",
    }
    video_result = _fal_submit(video_model, video_args)
    video_url, _ = _extract_media_urls(video_result)
    if not video_url:
        raise ValueError(
            f"Video model returned no URL. Keys: {list(video_result.keys()) if isinstance(video_result, dict) else video_result}"
        )

    return {
        "video_url": video_url,
        "audio_url": audio_url,
        "source": f"{tts_model}+{video_model}",
    }


def generate_lecture_video(
    prompt: str,
    *,
    voice: str = "Sarah",
    avatar_url: str | None = None,
    video_prompt: str = "professional lecture speech",
    stability: float = 0.6,
    timestamps: bool = True,
    language_code_iso: str = "",
    apply_text_normalization: str = "auto",
    on_audio_ready=None,
) -> dict[str, str | None]:
    _ensure_fal_key()
    avatar = _resolve_avatar_url(avatar_url)
    text = prompt.strip()
    if not text:
        raise ValueError("Script text (prompt) is required for video generation")

    voice_name = voice or _env("FAL_VOICE", "Sarah")
    video_hint = video_prompt or _env("FAL_VIDEO_PROMPT", "professional lecture speech")
    mode = _fal_mode()

    if mode == "pipeline":
        return _run_public_pipeline(
            text,
            voice=voice_name,
            avatar_url=avatar,
            video_prompt=video_hint,
            apply_text_normalization=apply_text_normalization,
            on_audio_ready=on_audio_ready,
        )

    if mode == "workflow":
        return _run_custom_workflow(
            text,
            voice=voice_name,
            avatar_url=avatar,
            video_prompt=video_hint,
            stability=stability,
            timestamps=timestamps,
            language_code_iso=language_code_iso,
            apply_text_normalization=apply_text_normalization,
        )

    try:
        return _run_custom_workflow(
            text,
            voice=voice_name,
            avatar_url=avatar,
            video_prompt=video_hint,
            stability=stability,
            timestamps=timestamps,
            language_code_iso=language_code_iso,
            apply_text_normalization=apply_text_normalization,
        )
    except Exception as exc:
        if not _should_fallback_to_pipeline(exc):
            raise
        logger.warning("Custom workflow failed (%s), using public pipeline", exc)
        return _run_public_pipeline(
            text,
            voice=voice_name,
            avatar_url=WORKING_AVATAR_URL,
            video_prompt=video_hint,
            apply_text_normalization=apply_text_normalization,
            on_audio_ready=on_audio_ready,
        )


def generate_voice_from_text(
    text_prompt: str,
    *,
    voice: str | None = None,
    avatar_url: str | None = None,
    video_prompt: str | None = None,
    stability: float | None = None,
) -> dict[str, str | None]:
    return generate_lecture_video(
        text_prompt,
        voice=voice or _env("FAL_VOICE", "Sarah"),
        avatar_url=avatar_url,
        video_prompt=video_prompt or _env("FAL_VIDEO_PROMPT", "professional lecture speech"),
        stability=stability if stability is not None else float(_env("FAL_STABILITY", "0.6")),
    )
