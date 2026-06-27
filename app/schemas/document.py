from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentResponse(BaseModel):
    id: int
    original_name: str
    file_type: str
    file_size: int
    upload_date: datetime
    project_id: int
    title: Optional[str] = None
    author: Optional[str] = None
    page_count: Optional[int] = None
    extraction_status: Optional[str] = "pending"
    cleaned_text: Optional[str] = None

    class Config:
        from_attributes = True