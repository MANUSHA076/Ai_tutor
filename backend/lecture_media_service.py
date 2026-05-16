"""Shared lecture script + Fal video generation (sync, for threads and API)."""

from __future__ import annotations

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

from static_data import AVATARS


def _script_provider() -> str:
    """grok | local | rag | auto"""
    return (os.getenv("SCRIPT_PROVIDER", "auto") or "auto").lower()


def resolve_fal_media_options(body: Any) -> dict:
    voice = getattr(body, "voice", None)
    avatar_url = getattr(body, "avatar_url", None)
    avatar_id = getattr(body, "avatar_id", None)
    if avatar_id:
        for avatar in AVATARS:
            if avatar.get("id") == avatar_id:
                voice = voice or avatar.get("fal_voice") or avatar.get("name", "").replace("Dr. ", "")
                avatar_url = avatar_url or avatar.get("avatar_url")
                break
    return {
        "voice": voice or os.getenv("FAL_VOICE", "Sarah"),
        "avatar_url": avatar_url or os.getenv("FAL_DEFAULT_AVATAR_URL"),
        "video_prompt": getattr(body, "video_prompt", None)
        or os.getenv("FAL_VIDEO_PROMPT", "professional lecture speech"),
        "stability": getattr(body, "stability", None)
        if getattr(body, "stability", None) is not None
        else float(os.getenv("FAL_STABILITY", "0.6")),
    }


def script_from_rag_result(result: dict) -> tuple[str | None, str | None]:
    audio_url = result.get("audio_url")
    if not audio_url and isinstance(result.get("audio"), dict):
        audio_url = result["audio"].get("url")
    script = (
        result.get("audio_prompt")
        or result.get("script")
        or result.get("text")
        or result.get("response")
    )
    if isinstance(script, dict):
        import json

        script = script.get("text") or json.dumps(script)
    return (str(script).strip() if script else None), audio_url


def _summary_from_chunks(source: str) -> str | None:
    """Same bullets as GET /api/home/script?tab=notes."""
    from pipeline.service import get_chunks

    chunks = get_chunks(source)
    parts = [(c.get("text") or "").strip()[:220] for c in chunks[:6] if (c.get("text") or "").strip()]
    if parts:
        return "\n\n".join(parts)
    return None


def _script_from_local_chunks(source: str) -> str | None:
    from pipeline.service import get_chunks

    chunks = get_chunks(source)
    parts = [(c.get("text") or "").strip() for c in chunks[:16] if (c.get("text") or "").strip()]
    if parts:
        return "\n\n".join(parts)[:8000]
    return None


def _script_from_grok(pdf_path, instruction: str) -> str:
    from pipeline.grok_script import generate_script_from_pdf

    return generate_script_from_pdf(pdf_path, instruction)


def _script_from_rag(pdf_path, instruction: str) -> tuple[str | None, str | None]:
    from pipeline.rag_to_tts import is_rag_tts_configured, send_rag_to_tts

    if not is_rag_tts_configured():
        raise ValueError("RAG_TTS_API_URL not set — use SCRIPT_PROVIDER=grok or add ngrok URL")
    rag_result = send_rag_to_tts(instruction.strip(), pdf_path)
    return script_from_rag_result(rag_result)


def _script_from_summary_text(summary: str, instruction: str) -> str:
    from pipeline.grok_script import generate_script_from_summary, is_grok_configured

    if is_grok_configured():
        return generate_script_from_summary(summary, instruction)
    points = [line.strip() for line in summary.splitlines() if line.strip()]
    body = "\n\n".join(points)
    return (
        "Welcome to this lecture. Here is a summary of the key points from your notes.\n\n"
        f"{body}\n\n"
        "That concludes our overview of the main ideas."
    )


def resolve_lecture_script(body: Any) -> tuple[str | None, str | None, dict]:
    """
    Returns (script, direct_audio_url, fal_opts).
    Priority: script_text → summary (notes) → provider chain (grok / local / rag).
    """
    from pipeline.grok_script import is_grok_configured
    from pipeline.service import resolve_pdf_path

    fal_opts = resolve_fal_media_options(body)
    script = (getattr(body, "script_text", None) or "").strip()
    direct_audio: str | None = None
    source = getattr(body, "source", None)
    from_summary = bool(getattr(body, "from_summary", False))

    if script:
        return script, None, fal_opts

    summary = (getattr(body, "summary_text", None) or "").strip()
    if not summary and from_summary and source:
        summary = _summary_from_chunks(source) or ""

    if summary:
        instruction = (
            getattr(body, "text_message", None)
            or "Turn these lecture notes into a spoken video script."
        )
        return _script_from_summary_text(summary, instruction), None, fal_opts

    if from_summary:
        raise ValueError(
            "Could not build lecture summary from indexed PDF. "
            "Wait for “Indexed”, open Lecture Notes Summary, then retry."
        )

    if source and not from_summary:
        local = _script_from_local_chunks(source)
        if local:
            return local, None, fal_opts

    storage_path = getattr(body, "storage_path", None)
    if not storage_path:
        return None, None, fal_opts

    pdf_path = resolve_pdf_path(storage_path)
    if not pdf_path.exists():
        raise ValueError(f"PDF not found: {storage_path}")

    instruction = (
        getattr(body, "text_message", None)
        or "Summarize this document and write a clear lecture script for text-to-speech."
    )

    provider = _script_provider()

    if provider == "grok":
        if not is_grok_configured():
            raise ValueError("SCRIPT_PROVIDER=grok but XAI_API_KEY missing in backend/.env")
        try:
            return _script_from_grok(pdf_path, instruction), None, fal_opts
        except (ConnectionError, ValueError, OSError) as exc:
            local = _script_from_local_chunks(pdf_path.stem)
            if local:
                logger.warning("Grok failed (%s), using indexed PDF chunks", exc)
                return local, None, fal_opts
            raise ValueError(f"Grok failed and no indexed chunks: {exc}") from exc

    if provider == "local":
        local = _script_from_local_chunks(pdf_path.stem)
        if local:
            return local, None, fal_opts
        raise ValueError("No indexed chunks. Upload PDF and wait for indexing.")

    if provider == "rag":
        script, direct_audio = _script_from_rag(pdf_path, instruction)
        return script, direct_audio, fal_opts

    # auto: grok → local chunks → rag
    if is_grok_configured():
        try:
            return _script_from_grok(pdf_path, instruction), None, fal_opts
        except Exception:
            pass

    if source:
        local = _script_from_local_chunks(source)
        if local:
            return local, None, fal_opts

    local = _script_from_local_chunks(pdf_path.stem)
    if local:
        return local, None, fal_opts

    try:
        script, direct_audio = _script_from_rag(pdf_path, instruction)
        return script, direct_audio, fal_opts
    except OSError as exc:
        raise ValueError(
            "Cannot reach script service (Grok/RAG). Set XAI_API_KEY for Grok or fix internet."
        ) from exc

    return None, None, fal_opts


def generate_lecture_media(script: str, fal_opts: dict, on_audio_ready=None) -> dict:
    from pipeline.voice import generate_lecture_video

    return generate_lecture_video(
        script[:8000],
        voice=fal_opts["voice"],
        avatar_url=fal_opts["avatar_url"],
        video_prompt=fal_opts["video_prompt"],
        stability=fal_opts["stability"],
        on_audio_ready=on_audio_ready,
    )
