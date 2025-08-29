from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.enums.school_type import SchoolType

class SchoolBase(BaseModel):
    name: str
    type: str
    city: str
    state: str

class SchoolCreate(SchoolBase):
    pass

class SchoolUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class SchoolResponse(SchoolBase):
    id: int
    type: str
    city: str
    state: str
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class SchoolWithRelations(SchoolResponse):
    students: List[dict] = []

class SchoolListResponse(BaseModel):
    status: bool
    message: str
    data: List[SchoolWithRelations] = []

class SchoolDetailResponse(BaseModel):
    status: bool
    message: str
    data: SchoolWithRelations 