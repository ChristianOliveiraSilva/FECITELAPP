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
    
    def get_winner(self, db, position: int = None, school: str = None, category_id: int = None) -> str:
        from .question import Question
        from .response import Response
        from app.enums.question_type import QuestionType
        
        questions = db.query(Question).filter(
            Question.awards.any(id=self.id),
            Question.type == QuestionType.MULTIPLE_CHOICE
        ).all()
        
        if not questions:
            return "Não houve competidor"
        
        question_ids = [q.id for q in questions]
        responses = db.query(Response).filter(
            Response.question_id.in_(question_ids),
            Response.score.isnot(None)
        ).order_by(Response.score.desc()).all()
        
        if not responses or position > len(responses):
            return "Não houve competidor"
        
        target_response = responses[position - 1] if position else responses[0]
        
        if not target_response:
            return "Não houve competidor"
        
        assessment = target_response.assessment
        if not assessment or not assessment.project or not assessment.project.students:
            return "Não houve competidor"
        
        return assessment.project.students[0].name
    
    def get_winner_score(self, position: int, db) -> str:
        from .question import Question
        from .response import Response
        from app.enums.question_type import QuestionType
        
        questions = db.query(Question).filter(
            Question.awards.any(id=self.id),
            Question.type == QuestionType.MULTIPLE_CHOICE
        ).all()
        
        if not questions:
            return "-"
        
        question_ids = [q.id for q in questions]
        responses = db.query(Response).filter(
            Response.question_id.in_(question_ids),
            Response.score.isnot(None)
        ).order_by(Response.score.desc()).all()
        
        if not responses or position > len(responses):
            return "-"
        
        target_response = responses[position - 1]
        return str(target_response.score) if target_response else "-" 