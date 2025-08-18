from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class School(Base):
    __tablename__ = "schools"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(255), nullable=True)
    state = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    students = relationship("Student", back_populates="school")
    
    @property
    def full_name(self) -> str:
        """Get full name with city and state"""
        parts = [self.name]
        
        if self.city:
            parts.append(self.city)
        
        if self.state:
            parts.append(self.state)
        
        return " - ".join(parts) 