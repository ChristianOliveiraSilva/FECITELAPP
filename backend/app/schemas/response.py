from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ResponseBase(BaseModel):
    question_id: int
    assessment_id: int
    response: Optional[str] = None
    score: Optional[int] = None

class ResponseCreate(ResponseBase):
    pass

class ResponseUpdate(BaseModel):
    question_id: Optional[int] = None
    assessment_id: Optional[int] = None
    response: Optional[str] = None
    score: Optional[int] = None

class ResponseResponse(ResponseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class ResponseWithRelations(ResponseResponse):
    question: Optional[dict] = None
    assessment: Optional[dict] = None

class ResponseListResponse(BaseModel):
    status: bool
    message: str
    data: List[ResponseWithRelations] = []

class ResponseDetailResponse(BaseModel):
    status: bool
    message: str
    data: ResponseWithRelations 