import re

from pipeline.getdocs import totext
from pipeline.semantic import semantic_chunking_from_scratch


def clean_block(text: str) -> str:
    text = re.sub(
        r"These materials are ©.*|Any dissemination.*prohibited\.",
        "",
        text,
        flags=re.IGNORECASE,
    )
    text = re.sub(r"CHAPTER \d+.*?\d+", "", text)
    text = re.sub(r"(\w+)-\s+(\w+)", r"\1\2", text)
    return " ".join(text.split())


def formated_chunks(doc_path: str, threshold: float = 0.4) -> list[str]:
    markdown_content = totext(doc_path)
    semantic_chunks = semantic_chunking_from_scratch(markdown_content, threshold)
    return [clean_block(chunk) for chunk in semantic_chunks if clean_block(chunk)]


if __name__ == "__main__":
    for idx, block in enumerate(formated_chunks("docs/test.pdf")):
        print(f"Block {idx + 1}:\n{block[:200]}...\n")
