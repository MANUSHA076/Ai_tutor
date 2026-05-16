import os
from pathlib import Path

import chromadb
import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import CrossEncoder, SentenceTransformer

CHROMA_DIR = Path(__file__).resolve().parent.parent / "data" / "chroma"


class HybridSearcher:
    def __init__(self, formatted_data: list[dict], name: str, model_name: str = "all-MiniLM-L6-v2"):
        self.formatted_data = formatted_data
        token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        if token:
            try:
                self.vector_model = SentenceTransformer(model_name, token=token)
            except TypeError:
                self.vector_model = SentenceTransformer(model_name)
        else:
            self.vector_model = SentenceTransformer(model_name)
        CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        self.collection = self.client.get_or_create_collection(
            name=name[:63],
            metadata={"hnsw:space": "cosine"},
        )
        self.documents = [item["text"] for item in formatted_data]
        self.tokenized_documents = [doc.lower().split() for doc in self.documents]
        self.bm25 = BM25Okapi(self.tokenized_documents)

        ids = [item["id"] for item in formatted_data]
        embeddings = self.vector_model.encode(self.documents).tolist()
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=self.documents,
            metadatas=[item["metadata"] for item in formatted_data],
        )

    def _vector_search(self, query: str, top_n: int) -> list[dict]:
        query_embedding = self.vector_model.encode(query).tolist()
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_n,
            include=["documents", "metadatas", "distances"],
        )

        vector_results = []
        if results["ids"] and results["ids"][0]:
            for i, doc_id in enumerate(results["ids"][0]):
                original = next((item for item in self.formatted_data if item["id"] == doc_id), None)
                if original:
                    vector_results.append(
                        {
                            **original,
                            "vector_score": 1 - results["distances"][0][i],
                        }
                    )
        return vector_results

    def _keyword_search(self, query: str, top_n: int) -> list[dict]:
        tokenized_query = query.lower().split()
        doc_scores = self.bm25.get_scores(tokenized_query)
        top_indices = np.argsort(doc_scores)[::-1]
        top_indices_filtered = [idx for idx in top_indices if doc_scores[idx] > 0][:top_n]

        keyword_results = []
        for i in top_indices_filtered:
            original_item = self.formatted_data[i].copy()
            original_item["keyword_score"] = float(doc_scores[i])
            keyword_results.append(original_item)
        return keyword_results

    def search(self, query: str, top_n: int = 10) -> list[dict]:
        vector_results = self._vector_search(query, top_n=top_n)
        keyword_results = self._keyword_search(query, top_n=top_n)

        combined: dict[str, dict] = {}
        for res in vector_results:
            combined[res["id"]] = res
        for res in keyword_results:
            if res["id"] not in combined:
                combined[res["id"]] = res
        return list(combined.values())


class AdvancedRAGPipeline:
    def __init__(
        self,
        formatted_data: list[dict],
        name: str,
        vector_model: str = "all-MiniLM-L6-v2",
        rerank_model: str = "BAAI/bge-reranker-base",
    ):
        self.hybrid_searcher = HybridSearcher(formatted_data, name, model_name=vector_model)
        token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
        if token:
            try:
                self.reranker = CrossEncoder(rerank_model, token=token)
            except TypeError:
                self.reranker = CrossEncoder(rerank_model)
        else:
            self.reranker = CrossEncoder(rerank_model)

    def retrieve_and_rerank(self, query: str, top_k_hybrid: int = 10, top_n_final: int = 3) -> list[dict]:
        candidates = self.hybrid_searcher.search(query, top_n=top_k_hybrid)
        if not candidates:
            return []

        pairs = [[query, doc["text"]] for doc in candidates]
        rerank_scores = self.reranker.predict(pairs)

        for i, candidate in enumerate(candidates):
            candidate["rerank_score"] = float(rerank_scores[i])

        return sorted(candidates, key=lambda x: x["rerank_score"], reverse=True)[:top_n_final]
