"""Orchestrates PDF → chunks → RAG index. In-memory cache per source name."""

from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BACKEND_ROOT / "uploads"

_pipeline_cache: dict = {}
_chunk_cache: dict[str, list[dict]] = {}


def resolve_pdf_path(storage_path: str) -> Path:
    path = Path(storage_path)
    if not path.is_absolute():
        path = BACKEND_ROOT / storage_path
    if not path.exists():
        path = UPLOADS_DIR / Path(storage_path).name
    return path


def process_pdf(
    storage_path: str,
    *,
    threshold: float = 0.4,
    min_chars: int = 50,
) -> dict:
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
    }


def rag_query(source_name: str, query: str, top_n: int = 3) -> list[dict]:
    # 💡 Lazy Imports: සර්වර් එක ස්ටාර්ට් වෙද්දී හිරවීම වළක්වයි
    from pipeline.deps import require_ml
    from pipeline.rag import AdvancedRAGPipeline

    require_ml()
    pipeline = _pipeline_cache.get(source_name)
    if pipeline is None:
        raise KeyError(f"Document '{source_name}' not processed. Call POST /api/documents/process first.")

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