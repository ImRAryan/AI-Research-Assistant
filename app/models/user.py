from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database import Base


class AuthProvider(str, enum.Enum):
    local = "local"
    google = "google"
    github = "github"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)

    auth_provider = Column(
        Enum(AuthProvider),
        default=AuthProvider.local,
        nullable=False
    )
    oauth_provider_id = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    otp = Column(String(6), nullable=True)
    otp_expiry = Column(DateTime(timezone=True), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    projects = relationship(
        "Project",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    documents = relationship(
        "Document",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    chats = relationship(
        "Chat",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User id={self.id} email={self.email}>"