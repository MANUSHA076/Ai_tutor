from pathlib import Path

from pipeline.cleantext import formated_chunks


def format_for_rag(chunks: list[str], source_name: str) -> list[dict]:
    rag_data = []
    for i, content in enumerate(chunks):
        rag_data.append(
            {
                "id": f"{source_name}_{i}",
                "text": content,
                "metadata": {
                    "source": source_name,
                    "chunk_index": i,
                    "char_count": len(content),
                },
            }
        )
    return rag_data


def formated_data(path: str, threshold: float = 0.4, min_chars: int = 50) -> list[dict]:
    source_name = Path(path).stem
    final_chunks = formated_chunks(path, threshold=threshold)
    formatted = format_for_rag(final_chunks, source_name)
    return [item for item in formatted if len(item["text"]) >= min_chars]
