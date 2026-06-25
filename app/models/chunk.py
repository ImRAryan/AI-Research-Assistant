from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)
    page_number = Column(Integer, nullable=True)

    document = relationship("Document", back_populates="chunks")