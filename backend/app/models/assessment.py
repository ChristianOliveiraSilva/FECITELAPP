from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(Integer, primary_key=True, index=True)
    evaluator_id = Column(Integer, ForeignKey("evaluators.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    evaluator = relationship("Evaluator", back_populates="assessments")
    project = relationship("Project", back_populates="assessments")
    responses = relationship("Response", back_populates="assessment")
    
    @property
    def has_response(self) -> bool:
        return len(self.responses) > 0
    
    @property
    def note(self) -> float:
        responses_with_score = [r for r in self.responses if r.score is not None]
        
        if not responses_with_score:
            return 0.0
        
        total_score = sum(r.score for r in responses_with_score)
        return round(total_score / len(responses_with_score), 2) 