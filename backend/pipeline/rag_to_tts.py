"""Client for external POST /api/rag-to-tts (ngrok or self-hosted)."""

from __future__ import annotations

import json
import mimetypes
import os
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

BACKEND_ROOT = Path(__file__).resolve().parent.parent


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name, default) or "").strip().strip('"').strip("'")


def is_rag_tts_configured() -> bool:
    return bool(_env("RAG_TTS_API_URL"))


def _verify_ssl() -> bool:
    return _env("RAG_TTS_VERIFY_SSL", "true").lower() not in ("0", "false", "no")


def get_rag_tts_config() -> tuple[str, dict[str, str], int, bool]:
    url = _env("RAG_TTS_API_URL")
    if not url:
        raise ValueError(
            "RAG_TTS_API_URL not set. Add it to backend/.env "
            "(e.g. https://your-tunnel.ngrok-free.dev/api/rag-to-tts)"
        )
    headers = _default_headers()
    timeout = int(_env("RAG_TTS_TIMEOUT", "120"))
    return url, headers, timeout, _verify_ssl()


def _default_headers() -> dict[str, str]:
    headers = {
        "User-Agent": "EduAI-Backend/1.0",
        "Accept": "application/json",
    }
    if _env("RAG_TTS_NGROK_HEADER", "true").lower() in ("1", "true", "yes"):
        # ngrok free tier: any non-empty value skips the browser warning page
        headers["ngrok-skip-browser-warning"] = "true"
    return headers


def _build_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=2,
        backoff_factor=1.5,
        status_forcelist=(502, 503, 504),
        allowed_methods=["GET", "POST"],
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


def _friendly_request_error(exc: Exception, url: str) -> str:
    msg = str(exc)
    if "SSLError" in type(exc).__name__ or "SSL" in msg:
        return (
            "Cannot reach RAG-to-TTS server (SSL error). "
            "Your ngrok tunnel is probably offline or the URL expired. "
            "Run ngrok again, copy the new https URL into backend/.env as RAG_TTS_API_URL, "
            "then restart the backend (.\\start.ps1)."
        )
    if "Connection refused" in msg or "Failed to establish" in msg:
        return (
            "RAG-to-TTS server is not running. Start the remote service or update "
            f"RAG_TTS_API_URL (current: {url})."
        )
    if "timed out" in msg.lower() or "timeout" in msg.lower():
        return "RAG-to-TTS request timed out. The remote server may be loading a large model."
    return f"RAG-to-TTS request failed: {msg}"


def check_rag_tts_reachable() -> dict:
    """Quick connectivity check (does not upload a PDF)."""
    url, headers, timeout, verify = get_rag_tts_config()
    base = url.rsplit("/api/", 1)[0].rstrip("/") or url
    session = _build_session()
    try:
        response = session.get(
            base,
            headers=headers,
            timeout=min(15, timeout),
            verify=verify,
        )
        return {
            "reachable": True,
            "url": url,
            "probe": base,
            "status_code": response.status_code,
            "verify_ssl": verify,
        }
    except Exception as exc:
        return {
            "reachable": False,
            "url": url,
            "probe": base,
            "verify_ssl": verify,
            "error": _friendly_request_error(exc, url),
        }


def send_rag_to_tts(message: str, pdf_path: Path) -> dict:
    """Send text_message and a PDF file to the RAG-to-TTS API. Returns parsed JSON."""
    url, headers, timeout, verify = get_rag_tts_config()

    pdf_path = pdf_path.resolve()
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    if pdf_path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a .pdf file, got: {pdf_path.name}")

    mime = mimetypes.guess_type(pdf_path.name)[0] or "application/pdf"
    session = _build_session()

    try:
        with pdf_path.open("rb") as handle:
            response = session.post(
                url,
                headers=headers,
                data={"text_message": message},
                files={"file": (pdf_path.name, handle, mime)},
                timeout=timeout,
                verify=verify,
            )
    except requests.exceptions.RequestException as exc:
        raise ConnectionError(_friendly_request_error(exc, url)) from exc

    try:
        data = response.json()
    except json.JSONDecodeError:
        text = (response.text or "")[:500]
        if "ngrok" in text.lower() or "<!DOCTYPE" in text:
            raise ConnectionError(
                "Ngrok returned an HTML page instead of JSON. "
                "Tunnel may be offline — update RAG_TTS_API_URL in backend/.env."
            )
        response.raise_for_status()
        raise ValueError(f"Non-JSON response: {text}") from None

    if not response.ok:
        detail = data.get("detail", data)
        raise requests.HTTPError(
            f"HTTP {response.status_code}: {json.dumps(detail, indent=2)}",
            response=response,
        )

    return data
