from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.evaluator import Evaluator
from app.models.assessment import Assessment
from app.models.question import Question
from app.models.project import Project
from app.models.response import Response
from app.schemas.mobile_question import QuestionResponse
from app.utils.auth import get_current_evaluator
from app.enums.project_type import ProjectType

router = APIRouter()

@router.get("/questions/{assessment_id}", response_model=QuestionResponse)
async def get_questions_by_assessment(
    assessment_id: int,
    evaluator: Evaluator = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        
        if not assessment:
            return QuestionResponse(
                status=False,
                message="Avaliação não encontrada"
            )
        
        if assessment.evaluator_id != evaluator.id:
            return QuestionResponse(
                status=False,
                message="Você não tem permissão para acessar esta avaliação"
            )
        
        project = assessment.project
        project_type = ProjectType(project.projectType)
        
        questions = db.query(Question).all()
        
        responses = db.query(Response).filter(Response.assessment_id == assessment_id).all()
        
        responses_map = {response.question_id: response for response in responses}
        
        questions_data = []
        for question in questions:
            question_dict = {
                "id": question.id,
                "scientific_text": question.scientific_text,
                "technological_text": question.technological_text,
                "type": question.type,
                "number_alternatives": question.number_alternatives,
                "display_text": question.display_text
            }
            
            if question.id in responses_map:
                response = responses_map[question.id]
                question_dict["response"] = {
                    "id": response.id,
                    "question_id": response.question_id,
                    "response": response.response,
                    "score": response.score,
                    "created_at": response.created_at.isoformat() if response.created_at else None
                }
            else:
                question_dict["response"] = None
                
            questions_data.append(question_dict)
        
        response_data = {
            "project_type": {
                "value": project_type.value,
                "label": project_type.get_label()
            },
            "questions": questions_data,
            "has_responses": len(responses) > 0
        }
        
        return QuestionResponse(
            status=True,
            message="Questões recuperadas com sucesso",
            data=response_data
        )
        
    except Exception as e:
        return QuestionResponse(
            status=False,
            message="Erro ao recuperar questões"
        ) 