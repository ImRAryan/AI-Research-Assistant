from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, AuthProvider
from app.core.security import get_current_user, verify_password, hash_password
from app.schemas.user import UserUpdate, ChangePasswordRequest

import os
import shutil
from app.models.document import Document

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/")
def test_users():
    return {"message": "backend working"}


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "provider": current_user.auth_provider.value,
        "avatar_url": current_user.avatar_url
    }


@router.put("/me")
def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current user's display name."""
    current_user.name = data.name.strip()
    db.commit()
    db.refresh(current_user)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "provider": current_user.auth_provider.value,
        "avatar_url": current_user.avatar_url
    }


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change the current user's password. Only works for local accounts."""

    if current_user.auth_provider != AuthProvider.local:
        raise HTTPException(
            status_code=400,
            detail="Password change is not available for accounts signed in with Google."
        )

    if not current_user.password_hash or not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    current_user.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}



@router.delete("/me")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete the current user's account and all related data,
    including uploaded files and vector indexes on disk."""

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

    db.delete(current_user)
    db.commit()

    return {"message": "Account deleted successfully"}