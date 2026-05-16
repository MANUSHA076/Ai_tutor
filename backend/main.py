"""
EduAI — Python FastAPI backend + Supabase
Run: uvicorn main:app --reload --port 8000
"""

import env_config
from env_config import ensure_env_loaded, env, fal_key_configured

import asyncio
import json
import os
import tempfile
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware

from upload_storage import latest_local_document, list_local_documents, save_pdf

from db_helpers import (
    count_table,
    latest_document,
    latest_lecture,
    search_documents,
    search_lectures,
)
from static_data import (
    AVATARS,
    DEFAULT_SCRIPT_LINES,
    DEFAULT_SCRIPT_SUMMARY,
    DEFAULT_SETTINGS,
    STUDIO_CONFIG,
    SUBJECT_THUMB,
)
from supabase_client import (
    get_supabase,
    is_backend_key_recommended,
    is_configured,
    key_kind,
    validate_supabase_url,
)

app = FastAPI(title="EduAI API", version="1.0.0")


@app.on_event("startup")
def _load_env_on_startup() -> None:
    ensure_env_loaded()
    if fal_key_configured():
        print("[EduAI] FAL_KEY loaded from backend/.env")
    else:
        print("[EduAI] WARNING: FAL_KEY missing — add it to backend/.env and restart")
    print("[EduAI] Media API: POST /api/lecture/generate-audio/async + job polling")
    grok_ok = bool((env("XAI_API_KEY") or env("GROK_API_KEY")).strip())
    print(f"[EduAI] Script provider: {env('SCRIPT_PROVIDER', 'auto')} | Grok: {'yes' if grok_ok else 'no (add XAI_API_KEY)'}")

# Background ML jobs — avoids blocking other API calls (upload, session, script)
_pipeline_jobs: dict[str, dict] = {}

_cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
_vercel_url = env("VERCEL_URL", "").strip()
if _vercel_url:
    _cors_origins.append(f"https://{_vercel_url}")
_frontend_url = env("FRONTEND_URL", "").strip()
if _frontend_url:
    _cors_origins.append(_frontend_url.rstrip("/"))


class _StripRoutePrefixMiddleware(BaseHTTPMiddleware):
    """Vercel Services: requests arrive as /_/backend/api/... — strip to /api/..."""

    def __init__(self, app, prefix: str):
        super().__init__(app)
        self.prefix = prefix.rstrip("/")

    async def dispatch(self, request, call_next):
        path = request.scope.get("path") or ""
        if path == self.prefix or path.startswith(f"{self.prefix}/"):
            request.scope["path"] = path[len(self.prefix) :] or "/"
        return await call_next(request)


_route_prefix = env("BACKEND_ROUTE_PREFIX", "/_/backend").strip() or "/_/backend"
if env("VERCEL") or env("BACKEND_ROUTE_PREFIX"):
    app.add_middleware(_StripRoutePrefixMiddleware, prefix=_route_prefix)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _row_to_lecture(row: dict) -> dict:
    created = row.get("created_at") or ""
    date_val = row.get("date")
    if date_val is None and created:
        date_val = str(created)[:10]
    return {
        "id": row["id"],
        "title": row.get("title", "Untitled"),
        "subject": row.get("subject") or "General",
        "duration": row.get("duration", ""),
        "date": date_val or "",
        "dateLabel": row.get("date_label") or "",
        "instructor": row.get("instructor", ""),
        "instructorInitials": row.get("instructor_initials", ""),
        "thumbClass": row.get("thumb_class", "thumb-physics"),
        "description": row.get("description"),
        "content": row.get("content"),
    }


def _row_to_document(row: dict) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "size": row.get("size", ""),
        "status": row.get("status", "ready"),
        "label": row.get("label", "READY"),
        "progress": row.get("progress"),
        "storage_path": row.get("storage_path"),
    }


def _content_to_script_lines(content: str | None) -> list[dict]:
    if not content or not content.strip():
        return DEFAULT_SCRIPT_LINES
    lines = []
    for index, paragraph in enumerate(content.strip().split("\n")):
        text = paragraph.strip()
        if not text:
            continue
        minutes = index // 2
        seconds = (index % 2) * 30
        lines.append({"time": f"{minutes:02d}:{seconds:02d}", "text": text})
    return lines or DEFAULT_SCRIPT_LINES


def _description_to_summary(description: str | None) -> list[str]:
    if not description or not description.strip():
        return DEFAULT_SCRIPT_SUMMARY
    parts = [part.strip() for part in description.replace("\n", ".").split(".") if part.strip()]
    return parts[:6] or DEFAULT_SCRIPT_SUMMARY


# ─── Health ───────────────────────────────────────────────────────────────────


@app.get("/api/health")
def health():
    """Fast ping — must not block on Supabase/ML (used by frontend online check)."""
    ensure_env_loaded()
    rag_url = env("RAG_TTS_API_URL")
    dns_ok, dns_msg = validate_supabase_url() if is_configured() else (False, "not configured")
    return {
        "status": "ok",
        "supabase": is_configured(),
        "supabase_dns_ok": dns_ok,
        "supabase_dns": dns_msg if is_configured() else None,
        "supabase_key_kind": key_kind() if is_configured() else None,
        "supabase_key_ok": is_backend_key_recommended() if is_configured() else None,
        "rag_tts": bool(rag_url),
        "fal_configured": fal_key_configured(),
        "fal_mode": env("FAL_MODE", "auto"),
        "fal_workflow": env("FAL_WORKFLOW", "workflows/nsjayawardanaofficial/text2audio2video"),
        "script_provider": env("SCRIPT_PROVIDER", "auto"),
        "grok_configured": bool((env("XAI_API_KEY") or env("GROK_API_KEY")).strip()),
        "env_file": str(env_config._ENV_FILE),
    }


@app.get("/api/health/deep")
def health_deep():
    payload = {"status": "ok", "supabase": is_configured()}
    if is_configured():
        try:
            import concurrent.futures

            def ping():
                return get_supabase().table("lectures").select("id").limit(1).execute()

            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                pool.submit(ping).result(timeout=8)
            payload["supabase_connected"] = True
            payload["lectures_count"] = count_table("lectures")
            payload["documents_count"] = count_table("documents")
        except Exception as exc:
            payload["supabase_connected"] = False
            payload["supabase_error"] = str(exc)
    return payload


# ─── Lectures ─────────────────────────────────────────────────────────────────


@app.get("/api/lectures")
def get_lectures(
    subject: str | None = None,
    sort: str = "newest",
    page: int = 1,
):
    if not is_configured():
        return {"items": [], "page": page, "total": 0}

    query = get_supabase().table("lectures").select("*")
    if subject and subject != "All":
        query = query.eq("subject", subject)
    ascending = sort == "oldest"
    result = query.order("created_at", desc=not ascending).execute()
    items = [_row_to_lecture(row) for row in (result.data or [])]
    return {"items": items, "page": page, "total": len(items), "subject": subject, "sort": sort}


@app.get("/api/lectures/{lecture_id}")
def get_lecture(lecture_id: int):
    if not is_configured():
        return {"id": lecture_id}
    result = get_supabase().table("lectures").select("*").eq("id", lecture_id).single().execute()
    return _row_to_lecture(result.data)


@app.post("/api/lectures/generate")
def generate_lecture(payload: dict):
    subject = payload.get("subject") or "General"
    title = payload.get("title") or f"New {subject} Lecture"
    row = {
        "title": title,
        "subject": subject,
        "duration": "00:00",
        "date_label": "Just now",
        "instructor": "AI Tutor",
        "instructor_initials": "AI",
        "thumb_class": SUBJECT_THUMB.get(subject, "thumb-physics"),
        "description": payload.get("description", ""),
        "content": payload.get("content", ""),
    }

    if is_configured():
        result = get_supabase().table("lectures").insert(row).execute()
        if result.data:
            lecture = _row_to_lecture(result.data[0])
            return {"id": lecture["id"], "status": "processing", **lecture}

    return {"id": 0, "status": "processing", "title": title, "subject": subject}


# ─── Documents ────────────────────────────────────────────────────────────────


@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    page_start: str | None = Form(None),
    page_end: str | None = Form(None),
):
    from upload_storage import UPLOAD_DIR, sanitize_filename

    filename = sanitize_filename(file.filename or "upload.pdf")
    content_type = (file.content_type or "").lower()
    if content_type and content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="File is empty.")

    try:
        stored_name, storage_path = save_pdf(content, filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    size_mb = f"{len(content) / 1024 / 1024:.1f} MB"
    label = "READY"
    if page_start or page_end:
        label = f"READY · pp. {page_start or '?'}-{page_end or '?'}"

    row = {
        "name": filename,
        "size": size_mb,
        "status": "ready",
        "label": label,
        "storage_path": storage_path,
    }

    local_fallback = {
        "id": 0,
        "name": row["name"],
        "size": size_mb,
        "status": "ready",
        "label": label,
        "storage_path": storage_path,
        "db_saved": False,
    }

    if is_configured():
        if not is_backend_key_recommended():
            local_fallback["warning"] = (
                "PDF saved on server disk only. backend/.env needs SUPABASE_KEY=sb_secret_... "
                "(not sb_publishable_). Supabase Dashboard → API Keys → Secret key."
            )
            return local_fallback

        dns_ok, dns_msg = validate_supabase_url()
        if not dns_ok:
            local_fallback["warning"] = f"PDF saved on disk only. {dns_msg}"
            return local_fallback

        try:

            def insert_row():
                return get_supabase().table("documents").insert(row).execute()

            result = await asyncio.wait_for(run_in_threadpool(insert_row), timeout=25.0)
            if result.data:
                doc = _row_to_document(result.data[0])
                doc["db_saved"] = True
                return doc
        except asyncio.TimeoutError:
            local_fallback["warning"] = (
                "PDF saved on disk; Supabase timed out. Check network or use sb_secret_ key in backend/.env"
            )
            return local_fallback
        except OSError as exc:
            if getattr(exc, "errno", None) == 11001 or "getaddrinfo" in str(exc).lower():
                local_fallback["warning"] = (
                    "PDF saved on disk only. Cannot reach Supabase (DNS/network). "
                    "Check SUPABASE_URL in backend/.env and your internet connection."
                )
            else:
                local_fallback["warning"] = f"PDF saved on disk; network error: {exc}"
            return local_fallback
        except Exception as exc:
            err = str(exc)
            if "getaddrinfo" in err.lower() or "11001" in err:
                local_fallback["warning"] = (
                    "PDF saved on disk only. Supabase host not found — verify Project URL in .env"
                )
            else:
                local_fallback["warning"] = f"PDF saved on disk; database error: {exc}"
            return local_fallback

    return {**local_fallback, "db_saved": False}


@app.get("/api/documents/recent")
def recent_uploads():
    if not is_configured() or not is_backend_key_recommended():
        return {"items": list_local_documents(10)}
    try:
        result = (
            get_supabase()
            .table("documents")
            .select("*")
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        items = [_row_to_document(row) for row in (result.data or [])]
        if items:
            return {"items": items}
    except Exception:
        pass
    return {"items": list_local_documents(10)}


# ─── Avatars & Studio ─────────────────────────────────────────────────────────


@app.get("/api/avatars")
def get_avatars():
    return {"items": AVATARS}


@app.get("/api/avatars/studio-config")
def studio_config():
    return STUDIO_CONFIG


@app.put("/api/avatars/profile")
def save_avatar_profile(profile: dict):
    if is_configured():
        payload = {**DEFAULT_SETTINGS, "avatar_profile": profile}
        existing = get_supabase().table("user_settings").select("id").limit(1).execute()
        if existing.data:
            get_supabase().table("user_settings").update({"payload": payload}).eq(
                "id", existing.data[0]["id"]
            ).execute()
        else:
            get_supabase().table("user_settings").insert({"payload": payload}).execute()
    return {"saved": True, **profile}


@app.post("/api/avatars/preview")
def preview_avatar(payload: dict):
    return {"preview_url": None, "status": "ready", **payload}


# ─── Home dashboard ───────────────────────────────────────────────────────────


@app.get("/api/home/session")
def home_session():
    lecture = latest_lecture()
    document = latest_document() or latest_local_document()
    source_file = None
    supabase_warning = None
    if not is_backend_key_recommended() and is_configured():
        supabase_warning = (
            "Using publishable Supabase key — switch backend/.env to sb_secret_... for database saves."
        )
    if document:
        source_file = {"name": document.get("name"), "size": document.get("size", "")}
    elif lecture:
        source_file = {"name": f"{lecture.get('title', 'Lecture')}.pdf", "size": "—"}

    pipeline_source = None
    if document and document.get("storage_path"):
        try:
            from pathlib import Path
            from pipeline.service import get_chunks

            stem = Path(document["storage_path"]).stem
            if get_chunks(stem):
                pipeline_source = stem
        except Exception:
            pipeline_source = None

    return {
        "source_file": source_file,
        "metrics": {
            "lectureCount": count_table("lectures"),
            "documentCount": count_table("documents") or len(list_local_documents(100)),
        },
        "avatars": AVATARS[:4],
        "latest_lecture": _row_to_lecture(lecture) if lecture else None,
        "pipeline_source": pipeline_source,
        "supabase_warning": supabase_warning,
    }


@app.get("/api/home/script")
def home_script(
    tab: str = Query("script"),
    lecture_id: int | None = None,
    source: str | None = None,
):
    if source:
        from pipeline.service import get_chunks

        chunks = get_chunks(source)
        if chunks:
            if tab == "notes":
                summary = [c["text"][:220].strip() for c in chunks[:6] if c.get("text")]
                return {"tab": tab, "lines": [], "summary": summary or DEFAULT_SCRIPT_SUMMARY}
            lines = []
            for index, chunk in enumerate(chunks[:24]):
                text = (chunk.get("text") or "").strip()
                if not text:
                    continue
                minutes = (index * 15) // 60
                seconds = (index * 15) % 60
                lines.append({"time": f"{minutes:02d}:{seconds:02d}", "text": text[:600]})
            return {
                "tab": tab,
                "lines": lines or DEFAULT_SCRIPT_LINES,
                "summary": _description_to_summary(None),
            }

    lecture = None
    if is_configured():
        try:
            if lecture_id:
                result = (
                    get_supabase().table("lectures").select("*").eq("id", lecture_id).single().execute()
                )
                lecture = result.data
            else:
                lecture = latest_lecture()
        except Exception:
            lecture = None

    if tab == "notes":
        summary = _description_to_summary(lecture.get("description") if lecture else None)
        return {"tab": tab, "lines": [], "summary": summary}

    content = lecture.get("content") if lecture else None
    return {
        "tab": tab,
        "lines": _content_to_script_lines(content),
        "summary": _description_to_summary(lecture.get("description") if lecture else None),
    }


# ─── Settings ─────────────────────────────────────────────────────────────────


@app.get("/api/settings")
def get_settings():
    if not is_configured():
        return DEFAULT_SETTINGS
    try:
        result = get_supabase().table("user_settings").select("payload").limit(1).execute()
        if result.data and result.data[0].get("payload"):
            stored = result.data[0]["payload"]
            merged = {**DEFAULT_SETTINGS}
            for key in ("account", "preferences", "notifications", "privacy"):
                if key in stored and isinstance(stored[key], dict):
                    merged[key] = {**merged[key], **stored[key]}
            return merged
    except Exception:
        pass
    return DEFAULT_SETTINGS


@app.put("/api/settings")
def update_settings(settings: dict):
    if is_configured():
        try:
            existing = get_supabase().table("user_settings").select("id").limit(1).execute()
            if existing.data:
                get_supabase().table("user_settings").update({"payload": settings}).eq(
                    "id", existing.data[0]["id"]
                ).execute()
            else:
                get_supabase().table("user_settings").insert({"payload": settings}).execute()
        except Exception:
            pass
    return {"saved": True, **settings}


# ─── Search ───────────────────────────────────────────────────────────────────


@app.get("/api/search")
def search(q: str = "", scope: str = "all"):
    query = q.strip()
    results = []

    if not query:
        return {"query": q, "scope": scope, "results": []}

    if scope in ("all", "lectures"):
        for row in search_lectures(query):
            results.append(
                {
                    "type": "lecture",
                    "id": row["id"],
                    "title": row.get("title"),
                    "subject": row.get("subject"),
                }
            )

    if scope in ("all", "documents", "knowledge"):
        for row in search_documents(query):
            results.append(
                {
                    "type": "document",
                    "id": row["id"],
                    "title": row.get("name"),
                    "status": row.get("status"),
                }
            )

    if scope in ("all", "avatars"):
        lowered = query.lower()
        for avatar in AVATARS:
            haystack = f"{avatar['name']} {avatar.get('specialty', '')} {avatar.get('tag', '')}".lower()
            if lowered in haystack:
                results.append(
                    {
                        "type": "avatar",
                        "id": avatar["id"],
                        "title": avatar["name"],
                        "specialty": avatar.get("specialty"),
                    }
                )

    return {"query": q, "scope": scope, "results": results}


# ─── PDF pipeline + RAG + Voice (Fal.ai) ─────────────────────────────────────


class ProcessDocumentBody(BaseModel):
    storage_path: str = Field(..., description="e.g. uploads/abc_file.pdf from upload response")
    threshold: float = 0.4
    min_chars: int = 50


class RagQueryBody(BaseModel):
    source: str = Field(..., description="PDF stem name from process response")
    query: str
    top_n: int = 3


class VoiceBody(BaseModel):
    text_prompt: str
    avatar_id: str | None = None
    voice: str | None = None
    avatar_url: str | None = None
    video_prompt: str | None = None
    stability: float | None = None


class GenerateLectureAudioBody(BaseModel):
    storage_path: str | None = Field(None, description="PDF from /api/documents/upload")
    text_message: str = Field(
        default="Summarize this document and write a clear lecture script for text-to-speech.",
    )
    script_text: str | None = Field(None, description="Skip RAG if script already generated")
    summary_text: str | None = Field(
        None,
        description="Lecture notes summary bullets → spoken script (Grok) → video",
    )
    from_summary: bool = Field(
        False,
        description="Use notes-tab summary from indexed source (Summary → Video)",
    )
    source: str | None = Field(None, description="Indexed PDF stem — build script from local chunks")
    avatar_id: str | None = Field(None, description="Avatar id from /api/home/session avatars")
    voice: str | None = Field(None, description="Fal workflow voice, e.g. Sarah")
    avatar_url: str | None = Field(None, description="Portrait image URL for Fal avatar node")
    video_prompt: str | None = Field(None, description="Scene/style hint for video generation")
    stability: float | None = Field(None, ge=0, le=1)


def _resolve_fal_media_options(body: GenerateLectureAudioBody) -> dict:
    voice = body.voice
    avatar_url = body.avatar_url
    if body.avatar_id:
        for avatar in AVATARS:
            if avatar.get("id") == body.avatar_id:
                voice = voice or avatar.get("fal_voice") or avatar.get("name", "").replace("Dr. ", "")
                avatar_url = avatar_url or avatar.get("avatar_url")
                break
    return {
        "voice": voice or os.getenv("FAL_VOICE", "Sarah"),
        "avatar_url": avatar_url or os.getenv("FAL_DEFAULT_AVATAR_URL"),
        "video_prompt": body.video_prompt or os.getenv("FAL_VIDEO_PROMPT", "professional lecture speech"),
        "stability": body.stability if body.stability is not None else float(os.getenv("FAL_STABILITY", "0.6")),
    }


def _run_process_job(storage_path: str, threshold: float, min_chars: int) -> None:
    source_name = Path(storage_path).stem
    _pipeline_jobs[source_name] = {"status": "processing", "storage_path": storage_path}
    try:
        from pipeline.service import is_network_error, process_pdf, process_pdf_light

        try:
            result = process_pdf(storage_path, threshold=threshold, min_chars=min_chars)
        except Exception as exc:
            if is_network_error(exc):
                result = process_pdf_light(
                    storage_path,
                    threshold=threshold,
                    min_chars=min_chars,
                )
                result["warning"] = (
                    "Light indexing (offline) — HuggingFace unreachable. "
                    "Video/text still work; full RAG search needs internet + .\\install-ml.ps1"
                )
            else:
                raise
        _pipeline_jobs[source_name] = {"status": "ready", **result}
    except Exception as exc:
        err = str(exc)
        if "getaddrinfo" in err.lower() or "11001" in err:
            err = (
                "Network/DNS error while indexing. Check internet, VPN, or set "
                "RAG_INDEX_MODE=light in backend/.env"
            )
        _pipeline_jobs[source_name] = {"status": "failed", "error": err}


async def _schedule_process_job(storage_path: str, threshold: float, min_chars: int) -> None:
    """Run ML indexing in a worker thread so /api/health and uploads stay responsive."""
    await run_in_threadpool(
        lambda: _run_process_job(storage_path, threshold, min_chars),
    )


@app.post("/api/documents/process")
async def process_document_pipeline(body: ProcessDocumentBody, background_tasks: BackgroundTasks):
    """Start PDF indexing in background so upload/session APIs stay responsive."""
    from pipeline.service import resolve_pdf_path

    pdf_path = resolve_pdf_path(body.storage_path)
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail=f"PDF not found: {pdf_path}")

    source_name = pdf_path.stem
    _pipeline_jobs[source_name] = {"status": "queued", "storage_path": body.storage_path}
    background_tasks.add_task(
        _schedule_process_job,
        body.storage_path,
        body.threshold,
        body.min_chars,
    )
    return {
        "status": "processing",
        "source": source_name,
        "storage_path": body.storage_path,
        "message": "Indexing started in background",
        "chunk_count": 0,
        "preview": [],
    }


@app.post("/api/rag/query")
async def rag_query_endpoint(body: RagQueryBody):
    """Hybrid search + rerank on a processed document."""
    try:
        from pipeline.service import rag_query

        results = await run_in_threadpool(
            lambda: rag_query(body.source, body.query, top_n=body.top_n),
        )
        return {"source": body.source, "query": body.query, "results": results}
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/rag-to-tts/status")
async def rag_to_tts_status():
    """Check if the external RAG-to-TTS URL (ngrok) is reachable."""
    from pipeline.rag_to_tts import check_rag_tts_reachable, is_rag_tts_configured

    if not is_rag_tts_configured():
        return {"configured": False, "reachable": False, "error": "RAG_TTS_API_URL not set"}
    return await run_in_threadpool(check_rag_tts_reachable)


@app.post("/api/rag-to-tts")
async def rag_to_tts_proxy(
    text_message: str = Form(..., description="Question or instruction for the PDF"),
    file: UploadFile | None = File(None),
    storage_path: str | None = Form(None, description="Uploaded PDF path from /api/documents/upload"),
):
    """
    Proxy to external RAG-to-TTS service (RAG_TTS_API_URL in .env).
    Send either an uploaded file or storage_path from a prior document upload.
    """
    from pipeline.rag_to_tts import (
        check_rag_tts_reachable,
        is_rag_tts_configured,
        send_rag_to_tts,
    )
    from pipeline.service import resolve_pdf_path

    if not is_rag_tts_configured():
        raise HTTPException(
            status_code=503,
            detail="RAG_TTS_API_URL not configured in backend/.env",
        )

    message = (text_message or "").strip()
    if not message:
        raise HTTPException(status_code=400, detail="text_message is required")

    pdf_path: Path | None = None
    temp_path: Path | None = None

    try:
        if file and file.filename:
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail="Uploaded file is empty")
            suffix = Path(file.filename).suffix.lower() or ".pdf"
            if suffix != ".pdf":
                raise HTTPException(status_code=400, detail="Only PDF files are allowed")
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                tmp.write(content)
                temp_path = Path(tmp.name)
            pdf_path = temp_path
        elif storage_path:
            pdf_path = resolve_pdf_path(storage_path)
            if not pdf_path.exists():
                raise HTTPException(status_code=404, detail=f"PDF not found: {storage_path}")
        else:
            raise HTTPException(
                status_code=400,
                detail="Provide a PDF file upload or storage_path from document upload",
            )

        probe = await run_in_threadpool(check_rag_tts_reachable)
        if not probe.get("reachable"):
            raise HTTPException(status_code=503, detail=probe.get("error", "RAG-to-TTS unreachable"))

        result = await run_in_threadpool(lambda: send_rag_to_tts(message, pdf_path))
        return result
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except ConnectionError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        err = str(exc)
        if hasattr(exc, "response") and exc.response is not None:
            err = f"{exc} — {getattr(exc.response, 'text', '')[:300]}"
        raise HTTPException(status_code=502, detail=err) from exc
    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink(missing_ok=True)


def _script_from_rag_result(result: dict) -> tuple[str | None, str | None]:
    """Extract (script_text, direct_audio_url) from upstream RAG-to-TTS JSON."""
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
        script = script.get("text") or json.dumps(script)
    return (str(script).strip() if script else None), audio_url


@app.post("/api/lecture/generate-audio/async")
async def generate_lecture_audio_async(body: GenerateLectureAudioBody):
    """Start background Fal job — poll GET /jobs/{id} (no 300s browser timeout)."""
    from media_jobs import start_media_job

    if (
        not (body.script_text or "").strip()
        and not (body.summary_text or "").strip()
        and not body.storage_path
        and not body.source
    ):
        raise HTTPException(
            status_code=400,
            detail="Provide script_text, summary_text, storage_path, or source",
        )
    job_id = start_media_job(body)
    return {"job_id": job_id, "status": "running"}


@app.get("/api/lecture/generate-audio/jobs/{job_id}")
def get_generate_audio_job(job_id: str):
    from media_jobs import get_job

    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/api/lecture/generate-audio")
async def generate_lecture_audio(body: GenerateLectureAudioBody):
    """Sync generate (legacy). Prefer /async + poll for long Fal runs."""
    from lecture_media_service import generate_lecture_media, resolve_lecture_script

    try:
        script, direct_audio, fal_opts = await run_in_threadpool(
            lambda: resolve_lecture_script(body),
        )
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if direct_audio:
        return {
            "audio_url": direct_audio,
            "video_url": None,
            "script": script,
            "source": "rag-to-tts",
        }

    if not script:
        raise HTTPException(status_code=400, detail="No script text to synthesize")

    try:
        media = await run_in_threadpool(lambda: generate_lecture_media(script, fal_opts))
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "video_url": media.get("video_url"),
        "audio_url": media.get("audio_url") or media.get("video_url"),
        "script": script,
        "source": media.get("source") or "fal",
    }


@app.post("/api/generate-voice")
async def generate_voice_endpoint(body: VoiceBody):
    """Text → video + audio via Fal text2audio2video workflow"""
    try:
        from pipeline.voice import generate_lecture_video

        opts = _resolve_fal_media_options(
            GenerateLectureAudioBody(
                script_text=body.text_prompt,
                avatar_id=body.avatar_id,
                voice=body.voice,
                avatar_url=body.avatar_url,
                video_prompt=body.video_prompt,
                stability=body.stability,
            ),
        )
        media = await run_in_threadpool(
            lambda: generate_lecture_video(
                body.text_prompt,
                voice=opts["voice"],
                avatar_url=opts["avatar_url"],
                video_prompt=opts["video_prompt"],
                stability=opts["stability"],
            ),
        )
        return {
            "video_url": media.get("video_url"),
            "audio_url": media.get("audio_url") or media.get("video_url"),
        }
    except ValueError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/api/pipeline/status")
def pipeline_status():
    from pipeline.service import _chunk_cache, _pipeline_cache

    return {
        "indexed_sources": list(_pipeline_cache.keys()),
        "chunk_counts": {k: len(v) for k, v in _chunk_cache.items()},
        "jobs": _pipeline_jobs,
    }
