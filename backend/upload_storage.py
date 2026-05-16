import re
import uuid
from pathlib import Path

UPLOAD_DIR = Path(__file__).parent / "uploads"
MAX_BYTES = 50 * 1024 * 1024


def sanitize_filename(name: str) -> str:
    base = Path(name or "upload.pdf").name
    base = re.sub(r"[^\w.\-]", "_", base)
    return base if base.lower().endswith(".pdf") else f"{base}.pdf"


def save_pdf(content: bytes, original_name: str) -> tuple[str, str]:
    if len(content) > MAX_BYTES:
        raise ValueError("File exceeds 50MB limit")
    if not sanitize_filename(original_name).lower().endswith(".pdf"):
        raise ValueError("Only PDF files are allowed")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid.uuid4().hex}_{sanitize_filename(original_name)}"
    path = UPLOAD_DIR / stored_name
    path.write_bytes(content)
    return stored_name, str(path.relative_to(Path(__file__).parent)).replace("\\", "/")


def latest_local_document() -> dict | None:
    """Latest PDF on disk when Supabase is slow or unavailable."""
    if not UPLOAD_DIR.is_dir():
        return None
    pdfs = sorted(UPLOAD_DIR.glob("*.pdf"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not pdfs:
        return None
    return _document_from_path(pdfs[0])


def _document_from_path(path: Path) -> dict:
    display_name = path.name.split("_", 1)[1] if "_" in path.name else path.name
    return {
        "id": 0,
        "name": display_name,
        "size": f"{path.stat().st_size / 1024 / 1024:.1f} MB",
        "status": "ready",
        "label": "LOCAL",
        "storage_path": f"uploads/{path.name}".replace("\\", "/"),
    }


def list_local_documents(limit: int = 10) -> list[dict]:
    if not UPLOAD_DIR.is_dir():
        return []
    pdfs = sorted(UPLOAD_DIR.glob("*.pdf"), key=lambda p: p.stat().st_mtime, reverse=True)
    return [_document_from_path(path) for path in pdfs[:limit]]
