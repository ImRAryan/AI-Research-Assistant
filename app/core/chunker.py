from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_text(text: str, document_id: int, chunk_size: int = 5000, chunk_overlap: int = 500, pages_text: list = None) -> list[dict]:
    """
    Split cleaned document text into overlapping chunks for embedding.
    If pages_text is provided, attempts to tag each chunk with its likely page number.
    """
    if not text:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
    )

    raw_chunks = splitter.split_text(text)

    chunk_data = []
    for i, chunk in enumerate(raw_chunks):
        page_number = _estimate_page_number(chunk, pages_text) if pages_text else None

        chunk_data.append({
            "chunk_id": f"{document_id}_{i}",
            "document_id": document_id,
            "chunk_index": i,
            "chunk_text": chunk,
            "page_number": page_number,
        })

    return chunk_data


def _estimate_page_number(chunk_text: str, pages_text: list) -> int:
    """
    Estimate which page a chunk most likely came from by finding
    the page with the most character overlap with the chunk.
    """
    best_page = None
    best_overlap = 0

    chunk_snippet = chunk_text[:300].strip()

    for page in pages_text:
        page_text = page["text"]
        overlap = sum(1 for word in chunk_snippet.split() if word in page_text)

        if overlap > best_overlap:
            best_overlap = overlap
            best_page = page["page_number"]

    return best_page if best_page else (pages_text[0]["page_number"] if pages_text else None)