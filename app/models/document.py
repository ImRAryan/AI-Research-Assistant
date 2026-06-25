from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)  # ✅ required, replaces chat_id
    original_name = Column(String, nullable=False)
    stored_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    upload_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    extracted_text = Column(Text, nullable=True)
    cleaned_text = Column(Text, nullable=True)
    page_count = Column(Integer, nullable=True)
    title = Column(String, nullable=True)
    author = Column(String, nullable=True)
    extraction_status = Column(String, default="pending")

    owner = relationship("User", back_populates="documents")
    project = relationship("Project", back_populates="documents")  # ✅ new
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")