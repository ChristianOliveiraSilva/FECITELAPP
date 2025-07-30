from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EvaluatorBase(BaseModel):
    user_id: int
    PIN: str

class EvaluatorCreate(EvaluatorBase):
    pass

class EvaluatorUpdate(BaseModel):
    user_id: Optional[int] = None
    PIN: Optional[str] = None

class EvaluatorResponse(EvaluatorBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class EvaluatorWithRelations(EvaluatorResponse):
    user: Optional[dict] = None
    assessments: List[dict] = []
    categories: List[dict] = []

class EvaluatorListResponse(BaseModel):
    status: bool
    message: str
    data: List[EvaluatorWithRelations] = []

class EvaluatorDetailResponse(BaseModel):
    status: bool
    message: str
    data: EvaluatorWithRelations 