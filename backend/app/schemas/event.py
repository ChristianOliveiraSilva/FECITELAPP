from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventBase(BaseModel):
    year: int
    app_primary_color: Optional[str] = None
    app_font_color: Optional[str] = None
    app_logo_url: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    year: Optional[int] = None
    app_primary_color: Optional[str] = None
    app_font_color: Optional[str] = None
    app_logo_url: Optional[str] = None

class EventResponse(EventBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class EventListResponse(BaseModel):
    status: bool
    message: str
    data: list[EventResponse] = []

class EventDetailResponse(BaseModel):
    status: bool
    message: str
    data: EventResponse 