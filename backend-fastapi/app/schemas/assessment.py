from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AssessmentBase(BaseModel):
    evaluator_id: int
    project_id: int

class AssessmentCreate(AssessmentBase):
    pass

class AssessmentUpdate(BaseModel):
    evaluator_id: Optional[int] = None
    project_id: Optional[int] = None

class AssessmentResponse(AssessmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class AssessmentWithRelations(AssessmentResponse):
    evaluator: Optional[dict] = None
    project: Optional[dict] = None
    responses: List[dict] = []

class AssessmentListResponse(BaseModel):
    status: bool
    message: str
    data: List[AssessmentWithRelations] = []

class AssessmentDetailResponse(BaseModel):
    status: bool
    message: str
    data: AssessmentWithRelations 