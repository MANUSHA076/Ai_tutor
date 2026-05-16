from pypdf import PdfReader


def totext(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts)


def tomarkdown(text_content: str) -> str:
    return text_content
