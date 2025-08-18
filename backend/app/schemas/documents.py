from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    name: str
    type: str
    header: Optional[str] = None
    logo1: Optional[str] = None
    logo2: Optional[str] = None
    content: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    header: Optional[str] = None
    logo1: Optional[str] = None
    logo2: Optional[str] = None
    content: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DocumentListResponse(BaseModel):
    status: bool
    message: str
    data: list[DocumentResponse]

class DocumentDetailResponse(BaseModel):
    status: bool
    message: str
    data: DocumentResponse
