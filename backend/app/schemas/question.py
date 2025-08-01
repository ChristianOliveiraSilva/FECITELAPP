from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QuestionBase(BaseModel):
    scientific_text: Optional[str] = None
    technological_text: Optional[str] = None
    type: int
    number_alternatives: Optional[int] = None

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    scientific_text: Optional[str] = None
    technological_text: Optional[str] = None
    type: Optional[int] = None
    number_alternatives: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class QuestionWithRelations(QuestionResponse):
    responses: List[dict] = []
    awards: List[dict] = []

class QuestionListResponse(BaseModel):
    status: bool
    message: str
    data: List[QuestionWithRelations] = []

class QuestionDetailResponse(BaseModel):
    status: bool
    message: str
    data: QuestionWithRelations 