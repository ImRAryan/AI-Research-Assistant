from sqlalchemy.orm import Session

from app.core.embedder import generate_embedding
from app.core.vector_store import search_multiple_documents
from app.models.chunk import Chunk
from app.models.document import Document

TOP_K = 5
SIMILARITY_THRESHOLD = 0.3


def retrieve_relevant_chunks(project_id: int, query: str, db: Session) -> list[dict]:
    query_embedding = generate_embedding(query)

    # Get all document IDs belonging to this project
    document_ids = [
        d.id for d in db.query(Document).filter(Document.project_id == project_id).all()
    ]

    if not document_ids:
        print(f"No documents found for project {project_id}")
        return []

    results = search_multiple_documents(document_ids, query_embedding, top_k=TOP_K)

    print(f"\n{'='*60}")
    print(f"RETRIEVAL DEBUG — Project: {project_id}, Query: '{query}'")
    print(f"{'='*60}")
    print(f"Raw results from FAISS (top {TOP_K}, across {len(document_ids)} documents):")
    for r in results:
        print(f"  doc_id={r['document_id']}, chunk_id={r['chunk_id']}, similarity={r['similarity']:.4f}")

    filtered = [r for r in results if r["similarity"] >= SIMILARITY_THRESHOLD]

    if not filtered and results:
        print(f"\nNo chunks passed threshold ({SIMILARITY_THRESHOLD}), falling back to top 1 result")
        filtered = results[:1]
    else:
        print(f"\n{len(filtered)} chunk(s) passed threshold ({SIMILARITY_THRESHOLD})")

    chunk_ids = [r["chunk_id"] for r in filtered]

    chunks = db.query(Chunk).filter(Chunk.id.in_(chunk_ids)).all()
    chunk_map = {c.id: c for c in chunks}

    output = []
    for r in filtered:
        chunk = chunk_map.get(r["chunk_id"])
        if chunk:
            output.append({
                "chunk_id": chunk.id,
                "document_id": chunk.document_id,
                "chunk_text": chunk.chunk_text,
                "chunk_index": chunk.chunk_index,
                "page_number": chunk.page_number,
                "similarity": r["similarity"],
            })

    print(f"\nFinal chunks sent to LLM:")
    for o in output:
        print(f"  [doc_id={o['document_id']}, chunk_id={o['chunk_id']}] (similarity={o['similarity']:.4f}): {o['chunk_text'][:100]}...")
    print(f"{'='*60}\n")

    return output