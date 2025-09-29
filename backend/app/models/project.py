from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    year = Column(Integer, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    projectType = Column(Integer, nullable=False)
    external_id = Column(String(255), nullable=True)
    file = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    category = relationship("Category", back_populates="projects")
    students = relationship("Student", secondary="student_projects", back_populates="projects")
    supervisors = relationship("Supervisor", secondary="supervisor_projects", back_populates="projects")
    assessments = relationship("Assessment", back_populates="project")
    
    @property
    def school_grade(self) -> str:
        if self.students:
            return self.students[0].school_grade
        return ""
    
    def get_note_by_question(self, question_id: int, db) -> float:
        from .response import Response
        from .assessment import Assessment
        
        assessment_ids = [a.id for a in self.assessments]
        responses = db.query(Response).filter(
            Response.question_id == question_id,
            Response.assessment_id.in_(assessment_ids)
        ).all()
        
        if not responses:
            return 0.0
        
        total_score = sum(r.score or 0 for r in responses)
        return round(total_score / len(responses), 2)
    
    @property
    def final_note(self) -> float:
        assessments_with_responses = [a for a in self.assessments if a.has_response]
        if not assessments_with_responses:
            return 0.0
        
        total_notes = sum(a.note for a in assessments_with_responses)
        return round(total_notes / len(assessments_with_responses), 2) 