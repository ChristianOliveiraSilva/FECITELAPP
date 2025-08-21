from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.enums.school_grade import SchoolGrade
from app.enums.question_type import QuestionType

class Award(Base):
    __tablename__ = "awards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    school_grade = Column(Integer, nullable=True)
    total_positions = Column(Integer, nullable=True)
    use_school_grades = Column(Integer, nullable=True)
    use_categories = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    questions = relationship("Question", secondary="award_question", back_populates="awards")