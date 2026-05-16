"""PDF text → lecture script via xAI Grok API (replaces ngrok RAG-to-TTS)."""

from __future__ import annotations

import logging
import os
import time
from pathlib import Path

import requests

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "grok-2-1212"
API_URL = "https://api.x.ai/v1/chat/completions"
MAX_PDF_CHARS = 48_000


def _env(name: str, default: str = "") -> str:
    return (os.getenv(name, default) or "").strip().strip('"').strip("'")


def is_grok_configured() -> bool:
    return bool(_env("XAI_API_KEY") or _env("GROK_API_KEY"))


def _api_key() -> str:
    key = _env("XAI_API_KEY") or _env("GROK_API_KEY")
    if not key:
        raise ValueError(
            "Grok not configured. Add XAI_API_KEY to backend/.env "
            "(get key from https://console.x.ai/)"
        )
    return key


def extract_pdf_text(pdf_path: Path, max_chars: int = MAX_PDF_CHARS) -> str:
    from pypdf import PdfReader

    reader = PdfReader(str(pdf_path))
    parts: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            parts.append(text.strip())
    combined = "\n\n".join(parts).strip()
    if not combined:
        raise ValueError("Could not extract text from PDF (scanned image PDFs need OCR).")
    return combined[:max_chars]


def _max_retries() -> int:
    try:
        return max(1, int(_env("GROK_MAX_RETRIES", "3")))
    except ValueError:
        return 3


def _is_retryable_error(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return any(
        token in msg
        for token in (
            "ssl",
            "eof",
            "connection",
            "timeout",
            "timed out",
            "max retries",
            "broken pipe",
            "reset by peer",
            "temporarily unavailable",
        )
    )


def _friendly_request_error(exc: BaseException) -> ConnectionError:
    msg = str(exc)
    if "getaddrinfo" in msg.lower() or "11001" in msg:
        return ConnectionError(
            "Cannot reach Grok API (DNS/network). Check internet, VPN, and XAI_API_KEY."
        )
    if "ssl" in msg.lower() or "unexpected_eof" in msg.lower():
        return ConnectionError(
            "Grok API SSL/network error (often VPN, firewall, or unstable connection). "
            "Retry in a moment; video will use local summary if Grok keeps failing."
        )
    return ConnectionError(f"Grok API request failed: {exc}")


def local_script_from_summary(summary: str) -> str:
    """Spoken script without Grok — used when API is unreachable."""
    points = [line.strip() for line in summary.splitlines() if line.strip()]
    body = "\n\n".join(points)
    if not body:
        raise ValueError("Summary text is empty")
    return (
        "Welcome to this lecture. Here is a summary of the key points from your notes.\n\n"
        f"{body}\n\n"
        "That concludes our overview of the main ideas."
    )


def _chat_completion(system: str, user: str, *, model: str | None = None) -> str:
    api_key = _api_key()
    model_name = model or _env("GROK_MODEL", DEFAULT_MODEL)
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.4,
    }
    timeout = int(_env("GROK_TIMEOUT", "180"))
    last_exc: BaseException | None = None
    attempts = _max_retries()

    for attempt in range(attempts):
        try:
            response = requests.post(
                API_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=timeout,
            )
            if response.status_code >= 400:
                detail = response.text[:500]
                raise ValueError(f"Grok API error {response.status_code}: {detail}")

            data = response.json()
            choices = data.get("choices") or []
            if not choices:
                raise ValueError(f"Grok returned no choices. Keys: {list(data.keys())}")

            content = choices[0].get("message", {}).get("content", "")
            script = (content or "").strip()
            if not script:
                raise ValueError("Grok returned empty script text")
            return script
        except requests.RequestException as exc:
            last_exc = exc
            if attempt < attempts - 1 and _is_retryable_error(exc):
                delay = min(8, 2**attempt)
                logger.warning(
                    "Grok request failed (attempt %s/%s), retry in %ss: %s",
                    attempt + 1,
                    attempts,
                    delay,
                    exc,
                )
                time.sleep(delay)
                continue
            raise _friendly_request_error(exc) from exc
        except ValueError as exc:
            last_exc = exc
            if attempt < attempts - 1:
                time.sleep(min(4, 2**attempt))
                continue
            raise

    raise _friendly_request_error(last_exc or ConnectionError("Grok request failed"))


def generate_script_from_pdf(
    pdf_path: Path,
    instruction: str,
    *,
    model: str | None = None,
) -> str:
    """Send PDF text to Grok; return lecture script suitable for TTS/video."""
    doc_text = extract_pdf_text(pdf_path)
    system = (
        "You are an expert lecturer. Write a clear, spoken lecture script from the document. "
        "Use short paragraphs. No markdown headings. Suitable for text-to-speech."
    )
    user = (
        f"{instruction.strip()}\n\n"
        f"--- DOCUMENT START ---\n{doc_text}\n--- DOCUMENT END ---"
    )
    return _chat_completion(system, user, model=model)


def generate_script_from_summary(
    summary: str,
    instruction: str = "",
    *,
    model: str | None = None,
    allow_local_fallback: bool = True,
) -> str:
    """Turn lecture note summary bullets into a spoken video script."""
    system = (
        "You are an expert lecturer. Convert lecture note summary points into one fluent "
        "spoken script for an educational video. Use plain language, short paragraphs, "
        "no markdown or bullet lists. Suitable for text-to-speech (about 2–4 minutes)."
    )
    hint = instruction.strip() or (
        "Expand the summary into a natural lecture that covers all main points."
    )
    user = f"{hint}\n\n--- LECTURE NOTES SUMMARY ---\n{summary.strip()}\n--- END ---"
    try:
        return _chat_completion(system, user, model=model)
    except (ConnectionError, ValueError, OSError) as exc:
        if not allow_local_fallback:
            raise
        logger.warning("Grok unavailable for summary script, using local fallback: %s", exc)
        return local_script_from_summary(summary)
