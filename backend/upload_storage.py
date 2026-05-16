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
