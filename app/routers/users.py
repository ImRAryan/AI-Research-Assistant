from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.security import get_current_user

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