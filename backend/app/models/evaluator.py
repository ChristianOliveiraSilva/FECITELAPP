from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Evaluator(Base):
    __tablename__ = "evaluators"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    PIN = Column(String(4), unique=True, nullable=False)
    year = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="evaluator")
    assessments = relationship("Assessment", back_populates="evaluator")
    categories = relationship("Category", secondary="evaluator_categories", back_populates="evaluators")
        
    @property
    def total_projects(self) -> int:
        return len(self.assessments) 