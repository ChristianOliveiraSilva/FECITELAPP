from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PasswordResetConfigBase(BaseModel):
    mail_template: str

class PasswordResetConfigCreate(PasswordResetConfigBase):
    pass

class PasswordResetConfigUpdate(BaseModel):
    mail_template: Optional[str] = None

class PasswordResetConfigResponse(PasswordResetConfigBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class PasswordResetConfigListResponse(BaseModel):
    status: bool
    message: str
    data: list[PasswordResetConfigResponse] = []

class PasswordResetConfigDetailResponse(BaseModel):
    status: bool
    message: str
    data: PasswordResetConfigResponse
