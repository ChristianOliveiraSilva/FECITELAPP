from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    year: int
    category_id: int
    projectType: int
    external_id: Optional[str] = None
    file: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None
    category_id: Optional[int] = None
    projectType: Optional[int] = None
    external_id: Optional[str] = None
    file: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class ProjectWithRelations(ProjectResponse):
    category: Optional[dict] = None
    students: List[dict] = []
    assessments: List[dict] = []

class ProjectListResponse(BaseModel):
    status: bool
    message: str
    data: List[ProjectWithRelations] = []

class ProjectDetailResponse(BaseModel):
    status: bool
    message: str
    data: ProjectWithRelations 