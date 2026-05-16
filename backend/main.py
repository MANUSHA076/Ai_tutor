"""
EduAI — Python FastAPI backend + Supabase
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware

from upload_storage import save_pdf

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
from supabase_client import get_supabase, is_configured

app = FastAPI(title="EduAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
    payload = {"status": "ok", "supabase": is_configured()}
    if is_configured():
        try:
            get_supabase().table("lectures").select("id").limit(1).execute()
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

    if is_configured():
        try:
            result = get_supabase().table("documents").insert(row).execute()
            if result.data:
                return _row_to_document(result.data[0])
        except Exception as exc:
            (UPLOAD_DIR / stored_name).unlink(missing_ok=True)
            raise HTTPException(status_code=500, detail=f"Could not save to database: {exc}") from exc

    return {"id": 0, "name": row["name"], "size": size_mb, "status": "ready", "label": label}


@app.get("/api/documents/recent")
def recent_uploads():
    if not is_configured():
        return {"items": []}
    try:
        result = (
            get_supabase()
            .table("documents")
            .select("*")
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        return {"items": [_row_to_document(row) for row in (result.data or [])]}
    except Exception:
        return {"items": []}


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
    document = latest_document()
    source_file = None
    if document:
        source_file = {"name": document.get("name"), "size": document.get("size", "")}
    elif lecture:
        source_file = {"name": f"{lecture.get('title', 'Lecture')}.pdf", "size": "—"}

    return {
        "source_file": source_file,
        "metrics": {
            "lectureCount": count_table("lectures"),
            "documentCount": count_table("documents"),
        },
        "avatars": AVATARS[:4],
        "latest_lecture": _row_to_lecture(lecture) if lecture else None,
    }


@app.get("/api/home/script")
def home_script(tab: str = Query("script"), lecture_id: int | None = None):
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
