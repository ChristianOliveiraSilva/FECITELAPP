from pydantic import BaseModel
from typing import Optional, List

class QuestionInfo(BaseModel):
    id: int
    scientific_text: Optional[str]
    technological_text: Optional[str]
    type: int
    number_alternatives: Optional[int]
    display_text: str

class ProjectTypeInfo(BaseModel):
    value: int
    label: str

class QuestionsResponse(BaseModel):
    status: bool
    data: dict

class QuestionResponse(BaseModel):
    status: bool
    message: str
    data: Optional[dict] = None 