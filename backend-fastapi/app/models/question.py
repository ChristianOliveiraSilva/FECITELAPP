from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
from app.enums.question_type import QuestionType

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    scientific_text = Column(Text, nullable=True)
    technological_text = Column(Text, nullable=True)
    type = Column(Integer, nullable=False)
    number_alternatives = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    responses = relationship("Response", back_populates="question")
    awards = relationship("Award", secondary="award_question", back_populates="questions")
    
    @property
    def display_text(self) -> str:
        texts = []
        if self.scientific_text:
            texts.append(self.scientific_text)
        if self.technological_text:
            texts.append(self.technological_text)
        return "\n\n".join(texts) 