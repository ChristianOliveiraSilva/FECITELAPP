from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    PIN: str

class LoginResponse(BaseModel):
    status: bool
    message: str
    data: Optional[dict] = None

class LogoutResponse(BaseModel):
    status: bool
    message: str
    data: Optional[dict] = None

class UserInfo(BaseModel):
    id: int
    name: str
    email: str

class LoginData(BaseModel):
    user: UserInfo
    plainTextToken: str 