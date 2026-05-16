"""In-memory jobs for long Fal video generation (avoids HTTP timeout at 300s)."""

from __future__ import annotations

import threading
import time
import uuid
from typing import Any

_jobs: dict[str, dict[str, Any]] = {}
_lock = threading.Lock()


def _now() -> float:
    return time.time()


def create_job() -> str:
    job_id = uuid.uuid4().hex
    with _lock:
        _jobs[job_id] = {
            "id": job_id,
            "status": "queued",
            "step": "queued",
            "message": "Starting…",
            "video_url": None,
            "audio_url": None,
            "script": None,
            "source": None,
            "error": None,
            "created_at": _now(),
            "updated_at": _now(),
        }
    return job_id


def get_job(job_id: str) -> dict[str, Any] | None:
    with _lock:
        job = _jobs.get(job_id)
        return dict(job) if job else None


def _update(job_id: str, **fields: Any) -> None:
    with _lock:
        job = _jobs.get(job_id)
        if not job:
            return
        job.update(fields)
        job["updated_at"] = _now()


def run_media_job(job_id: str, body: Any) -> None:
    from lecture_media_service import generate_lecture_media, resolve_lecture_script

    try:
        _update(job_id, status="running", step="prepare", message="Preparing script…")
        script, direct_audio, fal_opts = resolve_lecture_script(body)

        if direct_audio:
            _update(
                job_id,
                status="completed",
                step="done",
                message="Audio ready",
                audio_url=direct_audio,
                video_url=None,
                script=script,
                source="rag-to-tts",
            )
            return

        if not script:
            raise ValueError("No script text to synthesize")

        _update(
            job_id,
            step="fal",
            message="Fal: speech + video (usually 3–8 min)…",
        )
        media = generate_lecture_media(script, fal_opts)
        _update(
            job_id,
            status="completed",
            step="done",
            message="Video ready",
            video_url=media.get("video_url"),
            audio_url=media.get("audio_url") or media.get("video_url"),
            script=script,
            source=media.get("source") or "fal",
        )
    except Exception as exc:
        _update(
            job_id,
            status="failed",
            step="error",
            message="Generation failed",
            error=str(exc),
        )


def start_media_job(body: Any) -> str:
    job_id = create_job()
    threading.Thread(target=run_media_job, args=(job_id, body), daemon=True).start()
    return job_id
