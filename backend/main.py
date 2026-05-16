"""
EduAI — Python FastAPI backend + Supabase
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/api/health")
def health():
    payload = {"status": "ok", "supabase": is_configured()}
    if is_configured():
        try:
            get_supabase().table("lectures").select("id").limit(1).execute()
            payload["supabase_connected"] = True
        except Exception as exc:
            payload["supabase_connected"] = False
            payload["supabase_error"] = str(exc)
    return payload


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
    return {"id": 1, "status": "processing", **payload}


@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    content = await file.read()
    size_mb = f"{len(content) / 1024 / 1024:.1f} MB"
    row = {
        "name": file.filename,
        "size": size_mb,
        "status": "ready",
        "label": "READY",
    }

    if is_configured():
        result = get_supabase().table("documents").insert(row).execute()
        if result.data:
            return _row_to_document(result.data[0])

    return {"id": 1, "name": file.filename, "size": size_mb, "status": "ready", "label": "READY"}


@app.get("/api/documents/recent")
def recent_uploads():
    if not is_configured():
        return {"items": []}
    result = get_supabase().table("documents").select("*").order("created_at", desc=True).limit(10).execute()
    return {"items": [_row_to_document(row) for row in (result.data or [])]}


@app.get("/api/avatars")
def get_avatars():
    return {"items": []}


@app.get("/api/avatars/studio-config")
def studio_config():
    return {"visual_styles": [], "voice_tones": [], "backgrounds": []}


@app.put("/api/avatars/profile")
def save_avatar_profile(profile: dict):
    return {"saved": True, **profile}


@app.post("/api/avatars/preview")
def preview_avatar(payload: dict):
    return {"preview_url": None, **payload}


@app.get("/api/home/session")
def home_session():
    return {"source_file": None, "metrics": {}, "avatars": []}


@app.get("/api/home/script")
def home_script(tab: str = Query("script")):
    return {"tab": tab, "lines": []}


DEFAULT_SETTINGS = {
    "account": {"name": "Alex Morgan", "email": "alex@edututor.ai"},
    "preferences": {},
    "notifications": {},
    "privacy": {},
}


@app.get("/api/settings")
def get_settings():
    if not is_configured():
        return DEFAULT_SETTINGS
    result = get_supabase().table("user_settings").select("payload").limit(1).execute()
    if result.data:
        return result.data[0]["payload"]
    return DEFAULT_SETTINGS


@app.put("/api/settings")
def update_settings(settings: dict):
    if is_configured():
        existing = get_supabase().table("user_settings").select("id").limit(1).execute()
        if existing.data:
            get_supabase().table("user_settings").update({"payload": settings}).eq("id", existing.data[0]["id"]).execute()
        else:
            get_supabase().table("user_settings").insert({"payload": settings}).execute()
    return {"saved": True, **settings}


@app.get("/api/search")
def search(q: str = "", scope: str = "all"):
    return {"query": q, "scope": scope, "results": []}
