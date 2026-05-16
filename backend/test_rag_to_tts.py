"""Test client for POST /api/rag-to-tts (local proxy or remote ngrok URL).

Usage:
  python test_rag_to_tts.py "Summarize this document" path\\to\\file.pdf

Uses RAG_TTS_API_URL from backend/.env when set.
Otherwise calls local backend: http://127.0.0.1:8000/api/rag-to-tts
"""

from __future__ import annotations

import json
import mimetypes
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

LOCAL_URL = "http://127.0.0.1:8000/api/rag-to-tts"


def _remote_url() -> str | None:
    url = (os.getenv("RAG_TTS_API_URL") or "").strip()
    return url or None


def _headers() -> dict[str, str]:
    headers: dict[str, str] = {}
    if (os.getenv("RAG_TTS_NGROK_HEADER", "true") or "").lower() in ("1", "true", "yes"):
        headers["ngrok-skip-browser-warning"] = "true"
    return headers


def send_rag_request(message: str, pdf_path: Path, *, use_local: bool = False) -> dict:
    pdf_path = pdf_path.resolve()
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    if pdf_path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a .pdf file, got: {pdf_path.name}")

    url = LOCAL_URL if use_local or not _remote_url() else _remote_url()
    mime = mimetypes.guess_type(pdf_path.name)[0] or "application/pdf"
    timeout = int(os.getenv("RAG_TTS_TIMEOUT", "120"))

    with pdf_path.open("rb") as handle:
        response = requests.post(
            url,
            headers=_headers(),
            data={"text_message": message},
            files={"file": (pdf_path.name, handle, mime)},
            timeout=timeout,
        )

    try:
        data = response.json()
    except json.JSONDecodeError:
        response.raise_for_status()
        raise ValueError(f"Non-JSON response: {response.text}") from None

    if not response.ok:
        detail = data.get("detail", data)
        raise requests.HTTPError(
            f"HTTP {response.status_code}: {json.dumps(detail, indent=2)}",
            response=response,
        )

    return data


def print_usage() -> None:
    print("Usage: python test_rag_to_tts.py <message> <path-to.pdf> [--local]")
    print('Example: python test_rag_to_tts.py "Summarize this document" report.pdf')
    print("  --local  force http://127.0.0.1:8000/api/rag-to-tts (your FastAPI proxy)")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--local"]
    use_local = "--local" in sys.argv

    if len(args) < 2:
        print_usage()
        sys.exit(1)

    message = args[0]
    pdf_path = Path(args[1])

    try:
        result = send_rag_request(message, pdf_path, use_local=use_local)
    except (FileNotFoundError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
    except requests.RequestException as exc:
        print(f"Request failed: {exc}", file=sys.stderr)
        sys.exit(1)

    print(json.dumps(result, indent=2))
    if "audio_prompt" in result:
        print("\n--- audio_prompt ---\n")
        print(result["audio_prompt"])
