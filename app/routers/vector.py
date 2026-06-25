from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.database import get_db
from app.core.dependencies import get_current_user
from app.core.embedder import generate_embedding, generate_embeddings_batch
from app.core.vector_store import build_index, search_index
from app.models.user import User
from app.models.document import Document
from app.models.chunk import Chunk

router = APIRouter(tags=["Vector & Embedding"])


# =============================================================================
# Track 2.5 — Embedding API
# =============================================================================

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    text: str
    vector: List[float]
    dimension: int


@router.post("/embedding/generate", response_model=EmbeddingResponse)
def generate_embedding_endpoint(
    data: EmbeddingRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate an embedding vector for any given text."""
    vector = generate_embedding(data.text)
    return EmbeddingResponse(
        text=data.text,
        vector=vector,
        dimension=len(vector)
    )


# =============================================================================
# Track 2.6 — Vector Database APIs
# =============================================================================

class VectorIndexRequest(BaseModel):
    document_id: int

class VectorIndexResponse(BaseModel):
    document_id: int
    chunks_indexed: int
    status: str


@router.post("/vector/index", response_model=VectorIndexResponse)
def index_document_vectors(
    data: VectorIndexRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    (Re)build the FAISS index for a document's chunks.
    Useful if chunks were added/updated after initial upload.
    """
    doc = db.query(Document).filter(
        Document.id == data.document_id,
        Document.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    chunks = db.query(Chunk).filter(Chunk.document_id == doc.id).all()

    if not chunks:
        raise HTTPException(status_code=400, detail="No chunks found for this document")

    embeddings = [c.embedding for c in chunks if c.embedding]
    chunk_ids = [c.id for c in chunks if c.embedding]

    if not embeddings:
        raise HTTPException(status_code=400, detail="No embeddings found for this document's chunks")

    build_index(doc.id, embeddings, chunk_ids)

    return VectorIndexResponse(
        document_id=doc.id,
        chunks_indexed=len(embeddings),
        status="success"
    )


class VectorSearchRequest(BaseModel):
    document_id: int
    query: str
    top_k: Optional[int] = 5

class ChunkResult(BaseModel):
    chunk_id: int
    chunk_text: str

class VectorSearchResponse(BaseModel):
    query: str
    document_id: int
    results: List[ChunkResult]


@router.post("/vector/search", response_model=VectorSearchResponse)
def search_vectors(
    data: VectorSearchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search a document's vector index for chunks most similar to the query.
    """
    doc = db.query(Document).filter(
        Document.id == data.document_id,
        Document.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    query_embedding = generate_embedding(data.query)
    chunk_ids = search_index(doc.id, query_embedding, top_k=data.top_k)

    if not chunk_ids:
        return VectorSearchResponse(query=data.query, document_id=doc.id, results=[])

    chunks = db.query(Chunk).filter(Chunk.id.in_(chunk_ids)).all()

    # Preserve the order returned by FAISS (most relevant first)
    chunk_map = {c.id: c for c in chunks}
    ordered_results = [
        ChunkResult(chunk_id=cid, chunk_text=chunk_map[cid].chunk_text)
        for cid in chunk_ids if cid in chunk_map
    ]

    return VectorSearchResponse(
        query=data.query,
        document_id=doc.id,
        results=ordered_results
    )