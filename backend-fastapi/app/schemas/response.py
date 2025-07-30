from pydantic import BaseModel
from typing import Optional, List

class ResponseItem(BaseModel):
    question_id: int
    type: int
    value: Optional[str] = None

class ResponseRequest(BaseModel):
    assessment: int
    responses: List[ResponseItem]

class ResponseResponse(BaseModel):
    status: bool
    message: str
    data: Optional[dict] = None 