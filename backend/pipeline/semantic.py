import os
import re

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from pipeline.getdocs import totext

_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        model_name = os.getenv("HF_EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        if token:
            try:
                _model = SentenceTransformer(model_name, token=token)
            except TypeError:
                _model = SentenceTransformer(model_name)
        else:
            _model = SentenceTransformer(model_name)
    return _model


def semantic_chunking_from_scratch(text: str, threshold: float = 0.4) -> list[str]:
    sentences = re.split(r"(?<=[.!?]) +", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) < 2:
        return sentences

    model = _get_model()
    embeddings = model.encode(sentences)

    chunks: list[str] = []
    current_chunk = [sentences[0]]

    for i in range(len(embeddings) - 1):
        similarity = cosine_similarity([embeddings[i]], [embeddings[i + 1]])[0][0]
        if similarity < threshold:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentences[i + 1]]
        else:
            current_chunk.append(sentences[i + 1])

    chunks.append(" ".join(current_chunk))
    return chunks


if __name__ == "__main__":
    sample = totext("docs/test.pdf")
    print(len(semantic_chunking_from_scratch(sample, 0.4)))
