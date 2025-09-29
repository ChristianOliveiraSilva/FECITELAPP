from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SupervisorBase(BaseModel):
    name: str
    email: Optional[str] = None
    school_id: int
    year: int

class SupervisorCreate(SupervisorBase):
    pass

class SupervisorUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    school_id: Optional[int] = None
    year: Optional[int] = None

class SupervisorResponse(SupervisorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class SupervisorWithRelations(SupervisorResponse):
    school: Optional[dict] = None
    projects: List[dict] = []

class SupervisorListResponse(BaseModel):
    status: bool
    message: str
    data: List[SupervisorWithRelations] = []

class SupervisorDetailResponse(BaseModel):
    status: bool
    message: str
    data: SupervisorWithRelations
