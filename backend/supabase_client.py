import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")


def _env(name: str) -> str:
    value = os.getenv(name, "") or ""
    return value.strip().strip('"').strip("'")


SUPABASE_URL = _env("SUPABASE_URL")
SUPABASE_KEY = _env("SUPABASE_KEY")

_client = None


def is_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_KEY)


def reset_client() -> None:
    global _client
    _client = None


def get_supabase():
    global _client
    if not is_configured():
        raise RuntimeError("Supabase not configured. Set SUPABASE_URL and SUPABASE_KEY in backend/.env")
    if _client is None:
        from supabase import create_client

        _client = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _client
