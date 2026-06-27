import fitz  # PyMuPDF
from docx import Document as DocxDocument
import os

from app.core.text_cleaner import clean_text, remove_repeated_lines


def extract_pdf(file_path: str) -> dict:
    """Extract text and metadata from a PDF file, tracking text per page."""
    try:
        doc = fitz.open(file_path)

        full_text = ""
        pages_text = []

        for page_num, page in enumerate(doc, start=1):
            page_text = page.get_text()
            full_text += page_text + "\n"
            pages_text.append({"page_number": page_num, "text": page_text})

        metadata = doc.metadata
        page_count = doc.page_count

        doc.close()

        deduped_text = remove_repeated_lines(full_text)
        cleaned = clean_text(deduped_text)

        return {
            "text": full_text.strip(),
            "cleaned_text": cleaned,
            "pages_text": pages_text,
            "page_count": page_count,
            "title": metadata.get("title") or None,
            "author": metadata.get("author") or None,
            "status": "success"
        }

    except Exception as e:
        print(f"PDF extraction error: {e}")
        return {
            "text": "",
            "cleaned_text": "",
            "pages_text": [],
            "page_count": 0,
            "title": None,
            "author": None,
            "status": "failed"
        }


def extract_docx(file_path: str) -> dict:
    """Extract text from a DOCX file."""
    try:
        doc = DocxDocument(file_path)

        full_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])

        core_props = doc.core_properties

        deduped_text = remove_repeated_lines(full_text)
        cleaned = clean_text(deduped_text)

        return {
            "text": full_text.strip(),
            "cleaned_text": cleaned,
            "pages_text": [],
            "page_count": None,
            "title": core_props.title or None,
            "author": core_props.author or None,
            "status": "success"
        }

    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return {
            "text": "",
            "cleaned_text": "",
            "pages_text": [],
            "page_count": None,
            "title": None,
            "author": None,
            "status": "failed"
        }


def extract_document(file_path: str, file_type: str) -> dict:
    """Route to the correct extractor based on file type."""
    if file_type == "pdf":
        return extract_pdf(file_path)
    elif file_type in ("docx", "doc"):
        return extract_docx(file_path)
    else:
        return {
            "text": "",
            "cleaned_text": "",
            "pages_text": [],
            "page_count": None,
            "title": None,
            "author": None,
            "status": "failed"
        }