from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class StudentBase(BaseModel):
    name: str
    email: Optional[str] = None
    school_grade: str
    school_id: int
    year: int

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    school_grade: Optional[str] = None
    school_id: Optional[int] = None
    year: Optional[int] = None
class StudentResponse(StudentBase):
    id: int
    year: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class StudentWithRelations(StudentResponse):
    school: Optional[dict] = None
    projects: List[dict] = []

class StudentListResponse(BaseModel):
    status: bool
    message: str
    data: List[StudentWithRelations] = []

class StudentDetailResponse(BaseModel):
    status: bool
    message: str
    data: StudentWithRelations 