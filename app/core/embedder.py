from sentence_transformers import SentenceTransformer
import numpy as np

# Load model once at module level (avoids reloading on every request)
print("Loading embedding model...")
_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model loaded.")


def generate_embedding(text: str) -> list[float]:
    """Generate a single embedding vector for a piece of text (e.g. a query)."""
    embedding = _model.encode(text)
    return embedding.tolist()


def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple chunks at once (more efficient)."""
    embeddings = _model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()


def get_embedding_dimension() -> int:
    """Returns the vector dimension of this model (384 for MiniLM)."""
    return _model.get_sentence_embedding_dimension()