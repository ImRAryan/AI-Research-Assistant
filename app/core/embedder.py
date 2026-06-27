from sentence_transformers import SentenceTransformer
import numpy as np

_model = None  # ✅ not loaded yet


def _get_model():
    """Load the model on first use only, not at import time."""
    global _model
    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model loaded.")
    return _model


def generate_embedding(text: str) -> list[float]:
    """Generate a single embedding vector for a piece of text (e.g. a query)."""
    model = _get_model()
    embedding = model.encode(text)
    return embedding.tolist()


def generate_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for multiple chunks at once (more efficient)."""
    model = _get_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return embeddings.tolist()


def get_embedding_dimension() -> int:
    """Returns the vector dimension of this model (384 for MiniLM)."""
    model = _get_model()
    return model.get_sentence_embedding_dimension()