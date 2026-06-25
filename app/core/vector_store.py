import faiss
import numpy as np
import os
import pickle

VECTOR_DIR = "vector_indexes"
os.makedirs(VECTOR_DIR, exist_ok=True)


def build_index(document_id: int, embeddings: list[list[float]], chunk_ids: list[int]):
    """Build and save a per-document FAISS index using cosine similarity."""
    if not embeddings:
        return

    dimension = len(embeddings[0])
    vectors = np.array(embeddings).astype("float32")
    faiss.normalize_L2(vectors)

    index = faiss.IndexFlatIP(dimension)
    index.add(vectors)

    index_path = os.path.join(VECTOR_DIR, f"doc_{document_id}.index")
    faiss.write_index(index, index_path)

    mapping_path = os.path.join(VECTOR_DIR, f"doc_{document_id}.pkl")
    with open(mapping_path, "wb") as f:
        pickle.dump(chunk_ids, f)


def search_index_with_scores(document_id: int, query_embedding: list[float], top_k: int = 5) -> list[dict]:
    """Search a single document's index."""
    index_path = os.path.join(VECTOR_DIR, f"doc_{document_id}.index")
    mapping_path = os.path.join(VECTOR_DIR, f"doc_{document_id}.pkl")

    if not os.path.exists(index_path) or not os.path.exists(mapping_path):
        return []

    index = faiss.read_index(index_path)

    with open(mapping_path, "rb") as f:
        chunk_ids = pickle.load(f)

    query_vector = np.array([query_embedding]).astype("float32")
    faiss.normalize_L2(query_vector)

    scores, indices = index.search(query_vector, min(top_k, len(chunk_ids)))

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx != -1 and idx < len(chunk_ids):
            results.append({
                "chunk_id": chunk_ids[idx],
                "similarity": float(score)
            })

    return results


def search_multiple_documents(document_ids: list[int], query_embedding: list[float], top_k: int = 5) -> list[dict]:
    """
    ✅ NEW: Search across multiple documents' indexes (project-wide search).
    Merges results from each document's index, then returns the global top_k.
    """
    all_results = []

    for doc_id in document_ids:
        doc_results = search_index_with_scores(doc_id, query_embedding, top_k=top_k)
        for r in doc_results:
            r["document_id"] = doc_id  # tag which document this chunk came from
        all_results.extend(doc_results)

    # Sort all results across all documents by similarity, take global top_k
    all_results.sort(key=lambda x: x["similarity"], reverse=True)
    return all_results[:top_k]

def search_index(document_id: int, query_embedding: list[float], top_k: int = 5) -> list[int]:
    """Returns just chunk_ids — kept for backward compatibility with vector.py endpoints."""
    results = search_index_with_scores(document_id, query_embedding, top_k)
    return [r["chunk_id"] for r in results]