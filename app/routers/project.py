from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Project
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
)

router = APIRouter(prefix="/projects", tags=["Project"])

def get_project_or_404(project_id: int, user_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.user_id != user_id:
        raise HTTPException(status_code=404, detail="Project not found")  # Not 403!
    return project

@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new research project."""
    project = Project(
        user_id=current_user.id,
        project_name=data.project_name.strip(),
        description=data.description,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/", response_model=List[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all projects for the current user."""
    return db.query(Project).filter(
        Project.user_id == current_user.id,
        Project.is_active == True
    ).order_by(Project.updated_at.desc()).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific project (with ownership check)."""
    return get_project_or_404(project_id, current_user.id, db)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = get_project_or_404(project_id, current_user.id, db)
    if data.project_name is not None:
        project.project_name = data.project_name.strip()
    if data.description is not None:
        project.description = data.description
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Soft delete a project (sets is_active=False)."""
    project = get_project_or_404(project_id, current_user.id, db)
    project.is_active = False
    db.commit()

