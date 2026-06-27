from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.document import Document
from app.models.chat import Chat

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.delete("/chats/all")
def clear_all_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete all chats and their messages across every project belonging to the user.
    Projects and documents are left untouched.
    """
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).all()
    count = len(chats)

    for chat in chats:
        db.delete(chat)

    db.commit()

    return {"message": f"Deleted {count} chat(s) across all projects"}


@router.delete("/documents/all")
def clear_all_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete all uploaded documents across every project belonging to the user,
    including their physical files and FAISS vector indexes.
    Projects and chats are left untouched.
    """
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    count = len(documents)

    for doc in documents:
        file_path = os.path.join("uploads", doc.stored_name)
        if os.path.exists(file_path):
            os.remove(file_path)

        index_path = os.path.join("vector_indexes", f"doc_{doc.id}.index")
        mapping_path = os.path.join("vector_indexes", f"doc_{doc.id}.pkl")
        if os.path.exists(index_path):
            os.remove(index_path)
        if os.path.exists(mapping_path):
            os.remove(mapping_path)

        db.delete(doc)

    db.commit()

    return {"message": f"Deleted {count} document(s) across all projects"}


@router.delete("/projects/all")
def clear_all_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete all projects belonging to the user, including their documents,
    chats, chunks, physical files, and vector indexes. The account itself
    remains intact — only project data is wiped.
    """
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    count = len(projects)

    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    for doc in documents:
        file_path = os.path.join("uploads", doc.stored_name)
        if os.path.exists(file_path):
            os.remove(file_path)

        index_path = os.path.join("vector_indexes", f"doc_{doc.id}.index")
        mapping_path = os.path.join("vector_indexes", f"doc_{doc.id}.pkl")
        if os.path.exists(index_path):
            os.remove(index_path)
        if os.path.exists(mapping_path):
            os.remove(mapping_path)

    for project in projects:
        db.delete(project)
    db.commit()

    return {"message": f"Deleted {count} project(s) and all associated data"}