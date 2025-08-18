from sqlalchemy import Column, Integer, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base

class PasswordResetConfig(Base):
    __tablename__ = "password_reset_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    mail_template = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
