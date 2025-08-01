from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import secrets
import string

class PasswordReset(Base):
    __tablename__ = "password_resets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Integer, default=0)  # 0 = não usado, 1 = usado
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="password_resets")
    
    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(64))
    
    @staticmethod
    def create_reset_token(db, user_id: int, expires_in_hours: int = 24):
        """Create a new password reset token"""
        from datetime import datetime, timedelta
        
        # Invalidar tokens anteriores do usuário
        db.query(PasswordReset).filter(
            PasswordReset.user_id == user_id,
            PasswordReset.used == 0
        ).update({"used": 1})
        
        # Criar novo token
        token = PasswordReset.generate_token()
        expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
        
        password_reset = PasswordReset(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        
        db.add(password_reset)
        db.commit()
        
        return token 