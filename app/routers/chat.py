from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.core.dependencies import get_current_user
from app.core.rag_engine import run_rag_pipeline
from app.models.user import User
from app.models.chat import Chat, Message
from app.models.project import Project
from app.schemas.chat import ChatResponse, ChatDetailResponse

router = APIRouter(prefix="/projects/{project_id}/chats", tags=["Chat"])


def get_project_or_404(project_id: int, user_id: int, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=ChatResponse, status_code=201)
def create_chat(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)

    chat = Chat(user_id=current_user.id, project_id=project_id, title="New Chat")
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


@router.get("/", response_model=List[ChatResponse])
def list_chats(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)

    return db.query(Chat).filter(
        Chat.project_id == project_id,
        Chat.user_id == current_user.id
    ).order_by(Chat.created_at.desc()).all()


@router.get("/{chat_id}", response_model=ChatDetailResponse)
def get_chat(
    project_id: int,
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.project_id == project_id,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.post("/ask", response_model=ChatDetailResponse)
def ask(
    project_id: int,
    question: str = Form(...),
    chat_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)

    # ✅ Require at least one document before allowing chat
    from app.models.document import Document
    doc_count = db.query(Document).filter(Document.project_id == project_id).count()
    if doc_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least one document to this project before chatting."
        )

    # Create or get chat
    if chat_id:
        chat = db.query(Chat).filter(
            Chat.id == chat_id,
            Chat.project_id == project_id,
            Chat.user_id == current_user.id
        ).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
    else:
        title = question[:50] + "..." if len(question) > 50 else question
        chat = Chat(user_id=current_user.id, project_id=project_id, title=title)
        db.add(chat)
        db.commit()
        db.refresh(chat)

    # Save user message
    user_message = Message(
        chat_id=chat.id,
        role="user",
        content=question,
    )
    db.add(user_message)
    db.commit()

    # Run RAG pipeline across all documents in the project
    rag_result = run_rag_pipeline(project_id, question, db)
    ai_reply = rag_result["answer"]

    ai_message = Message(
        chat_id=chat.id,
        role="assistant",
        content=ai_reply,
    )
    db.add(ai_message)
    db.commit()
    db.refresh(chat)

    return chat


@router.delete("/{chat_id}", status_code=204)
def delete_chat(
    project_id: int,
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_project_or_404(project_id, current_user.id, db)

    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.project_id == project_id,
        Chat.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()