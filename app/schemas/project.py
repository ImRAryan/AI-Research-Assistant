from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProjectCreate(BaseModel):
    project_name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    description: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    project_name: str
    description: Optional[str] = None
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

