import importlib


def require_ml() -> None:
    modules = [
        ("numpy", "numpy"),
        ("scikit-learn", "sklearn"),
        ("rank-bm25", "rank_bm25"),
        ("chromadb", "chromadb"),
        ("sentence-transformers", "sentence_transformers"),
        ("torch", "torch"),
    ]
    missing = []
    for label, mod in modules:
        try:
            importlib.import_module(mod)
        except ImportError:
            missing.append(label)
    if missing:
        raise ImportError(
            "ML packages not installed: "
            + ", ".join(missing)
            + ". From backend folder run: .\\install-ml.ps1"
        )
