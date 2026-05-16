"""Shared lecture script + Fal video generation (sync, for threads and API)."""

from __future__ import annotations

import os
from typing import Any

from static_data import AVATARS


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


def resolve_lecture_script(body: Any) -> tuple[str | None, str | None, dict]:
    """
    Returns (script, direct_audio_url, fal_opts).
    direct_audio_url set when RAG returns audio without needing Fal video pipeline.
    """
    fal_opts = resolve_fal_media_options(body)
    script = (getattr(body, "script_text", None) or "").strip()
    direct_audio: str | None = None
    source = getattr(body, "source", None)

    if not script and source:
        from pipeline.service import get_chunks

        chunks = get_chunks(source)
        parts = [(c.get("text") or "").strip() for c in chunks[:16] if (c.get("text") or "").strip()]
        if parts:
            script = "\n\n".join(parts)[:8000]

    if not script:
        storage_path = getattr(body, "storage_path", None)
        if not storage_path:
            return None, None, fal_opts

        from pipeline.rag_to_tts import is_rag_tts_configured, send_rag_to_tts
        from pipeline.service import resolve_pdf_path

        if not is_rag_tts_configured():
            raise ValueError("RAG_TTS_API_URL not set — add ngrok URL to backend/.env")

        pdf_path = resolve_pdf_path(storage_path)
        if not pdf_path.exists():
            raise ValueError(f"PDF not found: {storage_path}")

        text_message = getattr(body, "text_message", "") or ""
        rag_result = send_rag_to_tts(text_message.strip(), pdf_path)
        script, direct_audio = script_from_rag_result(rag_result)
        if not script and not direct_audio:
            raise ValueError(
                f"RAG-to-TTS returned no script. Keys: {list(rag_result.keys())}"
            )

    return script, direct_audio, fal_opts


def generate_lecture_media(script: str, fal_opts: dict) -> dict:
    from pipeline.voice import generate_lecture_video

    return generate_lecture_video(
        script[:8000],
        voice=fal_opts["voice"],
        avatar_url=fal_opts["avatar_url"],
        video_prompt=fal_opts["video_prompt"],
        stability=fal_opts["stability"],
    )
