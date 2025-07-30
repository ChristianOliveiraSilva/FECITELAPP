from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AssessmentResponse(BaseModel):
    status: bool
    message: str
    data: List[dict] = []

class ProjectInfo(BaseModel):
    id: int
    title: str
    description: Optional[str]
    year: int
    category_id: int
    projectType: int
    external_id: Optional[str]
    school_grade: Optional[str]

class StudentInfo(BaseModel):
    id: int
    name: str
    school_grade: str

class AssessmentInfo(BaseModel):
    id: int
    evaluator_id: int
    project_id: int
    has_response: bool
    note: float
    project: ProjectInfo
    responses: List[dict] = [] 