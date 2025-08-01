from pydantic import BaseModel, EmailStr
from typing import Optional

class WebLoginRequest(BaseModel):
    email: str
    password: str

class WebUserInfo(BaseModel):
    id: int
    name: str
    email: str
    is_evaluator: bool

class WebLoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[WebUserInfo] = None
    token: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordResponse(BaseModel):
    success: bool
    message: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ResetPasswordResponse(BaseModel):
    success: bool
    message: str 