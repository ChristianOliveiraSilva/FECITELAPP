from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.assessment import Assessment
from app.models.response import Response
from app.models.question import Question
from app.schemas.mobile_response import ResponseRequest, ResponseResponse
from app.utils.auth import get_current_user
from app.enums.question_type import QuestionType

router = APIRouter()

@router.post("/responses", response_model=ResponseResponse)
async def store_responses(
    request: ResponseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get assessment
        assessment = db.query(Assessment).filter(Assessment.id == request.assessment).first()
        
        if not assessment:
            return ResponseResponse(
                status=False,
                message="Avaliação não encontrada"
            )
        
        # Delete existing responses if any
        if assessment.has_response:
            db.query(Response).filter(Response.assessment_id == assessment.id).delete()
        
        # Create new responses
        for response_item in request.responses:
            response_value = None
            score_value = None
            
            # Determine if it's text or multiple choice based on question type
            question = db.query(Question).filter(Question.id == response_item.question_id).first()
            
            if not question:
                return ResponseResponse(
                    status=False,
                    message=f"Pergunta com ID {response_item.question_id} não encontrada"
                )
            
            # Validate question type matches the expected type
            if question.type != response_item.type:
                return ResponseResponse(
                    status=False,
                    message=f"Tipo de pergunta não corresponde. Esperado: {question.type}, Recebido: {response_item.type}"
                )
            
            if question.type == QuestionType.TEXT.value:
                response_value = response_item.value
            elif question.type == QuestionType.MULTIPLE_CHOICE.value:
                try:
                    score_value = int(response_item.value) if response_item.value else None
                except (ValueError, TypeError):
                    return ResponseResponse(
                        status=False,
                        message=f"Valor inválido para questão de múltipla escolha: {response_item.value}"
                    )
            
            # Create response
            new_response = Response(
                question_id=response_item.question_id,
                assessment_id=assessment.id,
                response=response_value,
                score=score_value
            )
            db.add(new_response)
        
        db.commit()
        
        # Reload assessment with responses
        db.refresh(assessment)
        
        # Prepare response data
        assessment_data = {
            "id": assessment.id,
            "evaluator_id": assessment.evaluator_id,
            "project_id": assessment.project_id,
            "has_response": assessment.has_response,
            "note": assessment.note,
            "responses": [
                {
                    "id": response.id,
                    "question_id": response.question_id,
                    "response": response.response,
                    "score": response.score
                } for response in assessment.responses
            ]
        }
        
        return ResponseResponse(
            status=True,
            message="Respostas salvas com sucesso.",
            data=assessment_data
        )
        
    except Exception as e:
        db.rollback()
        print(f"Erro ao salvar respostas: {str(e)}")  # Log para debug
        return ResponseResponse(
            status=False,
            message=f"Erro ao salvar respostas: {str(e)}"
        ) 