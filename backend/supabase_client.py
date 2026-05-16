import os
import socket
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env", override=True)


def _env(name: str) -> str:
    value = os.getenv(name, "") or ""
    return value.strip().strip('"').strip("'")


SUPABASE_URL = _env("SUPABASE_URL")
SUPABASE_KEY = _env("SUPABASE_KEY")

_client = None


def is_configured() -> bool:
    return bool(SUPABASE_URL and SUPABASE_KEY)


def key_kind() -> str:
    """publishable keys often fail inserts (RLS) — backend needs secret/service_role."""
    k = SUPABASE_KEY
    if k.startswith("sb_publishable_"):
        return "publishable"
    if k.startswith("sb_secret_"):
        return "secret"
    if k.startswith("eyJ"):
        return "service_role_jwt"
    return "unknown"


def is_backend_key_recommended() -> bool:
    return key_kind() in ("secret", "service_role_jwt")


def validate_supabase_url() -> tuple[bool, str]:
    """DNS check — catches getaddrinfo failed before insert."""
    if not SUPABASE_URL:
        return False, "SUPABASE_URL is empty in backend/.env"
    parsed = urlparse(SUPABASE_URL)
    host = parsed.hostname
    if not host or not parsed.scheme.startswith("http"):
        return False, f"Invalid SUPABASE_URL: {SUPABASE_URL!r} (use https://xxx.supabase.co)"
    try:
        socket.getaddrinfo(host, 443)
        return True, host
    except socket.gaierror:
        return (
            False,
            f"Cannot resolve Supabase host '{host}'. Check internet, VPN, and URL in backend/.env "
            "(Dashboard → Settings → API → Project URL).",
        )


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
