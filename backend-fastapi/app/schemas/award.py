from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AwardBase(BaseModel):
    name: str
    description: Optional[str] = None

class AwardCreate(AwardBase):
    pass

class AwardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class AwardResponse(AwardBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class AwardWithRelations(AwardResponse):
    questions: List[dict] = []

class AwardListResponse(BaseModel):
    status: bool
    message: str
    data: List[AwardWithRelations] = []

class AwardDetailResponse(BaseModel):
    status: bool
    message: str
    data: AwardWithRelations 