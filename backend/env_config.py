"""Load backend/.env once for all modules (uvicorn reload-safe)."""

import os
from pathlib import Path

from dotenv import load_dotenv

_BACKEND_DIR = Path(__file__).resolve().parent
_ENV_FILE = _BACKEND_DIR / ".env"


def ensure_env_loaded() -> None:
    """Reload .env so edits apply without guessing uvicorn reload behavior."""
    if _ENV_FILE.is_file():
        load_dotenv(_ENV_FILE, override=True)


# Initial load at import
ensure_env_loaded()


def env(name: str, default: str = "") -> str:
    value = os.getenv(name, default) or ""
    return value.strip().strip('"').strip("'")


def fal_key_configured() -> bool:
    return bool(env("FAL_KEY"))
