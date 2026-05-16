"""Orchestrates PDF → chunks → RAG index. In-memory cache per source name."""

import os
import re
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BACKEND_ROOT / "uploads"

_pipeline_cache: dict = {}
_chunk_cache: dict[str, list[dict]] = {}


def is_network_error(exc: BaseException) -> bool:
    msg = str(exc).lower()
    if getattr(exc, "errno", None) == 11001:
        return True
    return any(
        token in msg
        for token in (
            "getaddrinfo",
            "name or service not known",
            "failed to resolve",
            "nodename nor servname",
            "network is unreachable",
            "connection refused",
        )
    )


def _index_mode() -> str:
    return (os.getenv("RAG_INDEX_MODE", "auto") or "auto").lower()


def resolve_pdf_path(storage_path: str) -> Path:
    path = Path(storage_path)
    if not path.is_absolute():
        path = BACKEND_ROOT / storage_path
    if not path.exists():
        path = UPLOADS_DIR / Path(storage_path).name
    return path


def process_pdf_light(
    storage_path: str,
    *,
    threshold: float = 0.4,
    min_chars: int = 50,
) -> dict:
    """Index PDF text chunks only — no HuggingFace download (works offline)."""
    from pipeline.setvdb import formated_data

    pdf_path = resolve_pdf_path(storage_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    source_name = pdf_path.stem
    formatted = formated_data(str(pdf_path), threshold=threshold, min_chars=min_chars)
    if not formatted:
        raise ValueError("No text chunks extracted from PDF")

    _chunk_cache[source_name] = formatted
    _pipeline_cache.pop(source_name, None)

    preview = [
        {"id": item["id"], "text": item["text"][:280], "metadata": item["metadata"]}
        for item in formatted[:5]
    ]
    return {
        "source": source_name,
        "storage_path": str(storage_path),
        "chunk_count": len(formatted),
        "preview": preview,
        "index_mode": "light",
    }


def _simple_chunk_search(chunks: list[dict], query: str, top_n: int) -> list[dict]:
    terms = [t for t in re.split(r"\W+", query.lower()) if len(t) > 2]
    if not terms:
        terms = query.lower().split()

    scored: list[tuple[float, dict]] = []
    for chunk in chunks:
        text = (chunk.get("text") or "").lower()
        score = sum(text.count(term) for term in terms)
        if score > 0:
            scored.append((float(score), chunk))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [
        {
            "id": c["id"],
            "text": c["text"],
            "metadata": c.get("metadata", {}),
            "rerank_score": score,
        }
        for score, c in scored[:top_n]
    ]


def process_pdf(
    storage_path: str,
    *,
    threshold: float = 0.4,
    min_chars: int = 50,
) -> dict:
    mode = _index_mode()
    if mode == "light":
        return process_pdf_light(storage_path, threshold=threshold, min_chars=min_chars)
    # 💡 Lazy Imports: මෝඩල්ස් ලෝඩ් වෙන්නේ මේ ෆන්ක්ෂන් එක රන් වෙද්දී විතරයි!
    from pipeline.deps import require_ml
    from pipeline.rag import AdvancedRAGPipeline
    from pipeline.setvdb import formated_data

    require_ml()
    pdf_path = resolve_pdf_path(storage_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    source_name = pdf_path.stem
    formatted = formated_data(str(pdf_path), threshold=threshold, min_chars=min_chars)
    if not formatted:
        raise ValueError("No text chunks extracted from PDF")

    pipeline = AdvancedRAGPipeline(formatted, source_name)
    _pipeline_cache[source_name] = pipeline
    _chunk_cache[source_name] = formatted

    preview = [
        {"id": item["id"], "text": item["text"][:280], "metadata": item["metadata"]}
        for item in formatted[:5]
    ]
    return {
        "source": source_name,
        "storage_path": str(storage_path),
        "chunk_count": len(formatted),
        "preview": preview,
        "index_mode": "full",
    }


def rag_query(source_name: str, query: str, top_n: int = 3) -> list[dict]:
    # 💡 Lazy Imports: සර්වර් එක ස්ටාර්ට් වෙද්දී හිරවීම වළක්වයි
    from pipeline.deps import require_ml
    from pipeline.rag import AdvancedRAGPipeline

    pipeline = _pipeline_cache.get(source_name)
    if pipeline is None:
        chunks = _chunk_cache.get(source_name) or []
        if chunks:
            return _simple_chunk_search(chunks, query, top_n)
        raise KeyError(f"Document '{source_name}' not processed. Call POST /api/documents/process first.")

    require_ml()
    results = pipeline.retrieve_and_rerank(query, top_n_final=top_n)
    return [
        {
            "id": r["id"],
            "text": r["text"],
            "metadata": r.get("metadata", {}),
            "rerank_score": r.get("rerank_score"),
        }
        for r in results
    ]


def get_chunks(source_name: str) -> list[dict]:
    return _chunk_cache.get(source_name, [])