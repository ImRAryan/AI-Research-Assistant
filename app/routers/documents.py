from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid
import os

from app.database import get_db
from app.core.dependencies import get_current_user
from app.core.document_processor import extract_document
from app.models.user import User
from app.models.document import Document
from app.models.project import Project
from app.schemas.document import DocumentResponse
from app.core.chunker import chunk_text
from app.models.chunk import Chunk
from app.core.embedder import generate_embeddings_batch
from app.core.vector_store import build_index

# ✅ Project-scoped router
router = APIRouter(prefix="/projects/{project_id}/documents", tags=["Documents"])

# ✅ Separate router for global "all documents" endpoint
global_router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def get_project_or_404(project_id: int, user_id: int, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    project_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)  # ✅ verify ownership

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size must be under 10MB")

    ext = ALLOWED_TYPES[file.content_type]
    stored_name = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join("uploads", stored_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    extraction_result = extract_document(file_path, ext)

    doc = Document(
        user_id=current_user.id,
        project_id=project_id,  # ✅ scoped to project
        original_name=file.filename,
        stored_name=stored_name,
        file_type=ext,
        file_size=len(contents),
        extracted_text=extraction_result["text"],
        cleaned_text=extraction_result["cleaned_text"],
        page_count=extraction_result["page_count"],
        title=extraction_result["title"],
        author=extraction_result["author"],
        extraction_status=extraction_result["status"],
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    if extraction_result["cleaned_text"]:
        chunk_list = chunk_text(
            extraction_result["cleaned_text"],
            doc.id,
            pages_text=extraction_result.get("pages_text")
        )

        if chunk_list:
            chunk_texts = [c["chunk_text"] for c in chunk_list]
            embeddings = generate_embeddings_batch(chunk_texts)

            chunk_objs = []
            for c, embedding in zip(chunk_list, embeddings):
                chunk_obj = Chunk(
                    document_id=doc.id,
                    chunk_index=c["chunk_index"],
                    chunk_text=c["chunk_text"],
                    embedding=embedding,
                    page_number=c.get("page_number"),
                )
                db.add(chunk_obj)
                chunk_objs.append(chunk_obj)
            db.commit()

            for c in chunk_objs:
                db.refresh(c)

            chunk_ids = [c.id for c in chunk_objs]
            build_index(doc.id, embeddings, chunk_ids)

    return doc


@router.get("/", response_model=List[DocumentResponse])
def list_project_documents(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)

    return db.query(Document).filter(
        Document.project_id == project_id,
        Document.user_id == current_user.id
    ).order_by(Document.upload_date.desc()).all()


@router.delete("/{document_id}", status_code=204)
def delete_document(
    project_id: int,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)

    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.project_id == project_id,
        Document.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = os.path.join("uploads", doc.stored_name)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(doc)
    db.commit()


@router.get("/download/{document_id}")
def download_document(
    project_id: int,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)

    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.project_id == project_id,
        Document.user_id == current_user.id
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = os.path.join("uploads", doc.stored_name)
    return FileResponse(
        path=file_path,
        filename=doc.original_name,
        media_type="application/octet-stream"
    )


# =============================================================================
# Global endpoint — all documents across all projects (for homepage)
# =============================================================================

@global_router.get("/all", response_model=List[DocumentResponse])
def list_all_documents(
    project_id: Optional[int] = None,  # ✅ optional filter by project
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.user_id == current_user.id)

    if project_id:
        query = query.filter(Document.project_id == project_id)

    return query.order_by(Document.upload_date.desc()).all()