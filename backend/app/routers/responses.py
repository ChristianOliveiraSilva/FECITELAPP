from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.response import Response
from app.models.question import Question
from app.models.assessment import Assessment
from app.schemas.response import (
    ResponseCreate, ResponseUpdate, ResponseListResponse, ResponseDetailResponse
)
from typing import Optional

router = APIRouter()

@router.get("/", response_model=ResponseListResponse)
async def get_responses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Response).filter(Response.deleted_at == None).options(
            joinedload(Response.question),
            joinedload(Response.assessment)
        )
        
        responses = query.offset(skip).limit(limit).all()
        
        response_data = []
        for response in responses:
            response_dict = {
                "id": response.id,
                "question_id": response.question_id,
                "assessment_id": response.assessment_id,
                "response": response.response,
                "score": response.score,
                "created_at": response.created_at,
                "updated_at": response.updated_at,
                "deleted_at": response.deleted_at,
                "question": None,
                "assessment": None
            }
            
            if response.question:
                response_dict["question"] = {
                    "id": response.question.id,
                    "scientific_text": response.question.scientific_text,
                    "technological_text": response.question.technological_text,
                    "type": response.question.type,
                    "number_alternatives": response.question.number_alternatives
                }
            
            if response.assessment:
                response_dict["assessment"] = {
                    "id": response.assessment.id,
                    "evaluator_id": response.assessment.evaluator_id,
                    "project_id": response.assessment.project_id
                }
            
            response_data.append(response_dict)
        
        return ResponseListResponse(
            status=True,
            message="Responses retrieved successfully",
            data=response_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar respostas: {str(e)}"
        )

@router.get("/{response_id}", response_model=ResponseDetailResponse)
async def get_response(
    response_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Response).filter(Response.deleted_at == None).options(
            joinedload(Response.question),
            joinedload(Response.assessment)
        )
        
        response = query.filter(Response.id == response_id).first()
        
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resposta não encontrada"
            )
        
        response_dict = {
            "id": response.id,
            "question_id": response.question_id,
            "assessment_id": response.assessment_id,
            "response": response.response,
            "score": response.score,
            "created_at": response.created_at,
            "updated_at": response.updated_at,
            "deleted_at": response.deleted_at,
            "question": None,
            "assessment": None
        }
        
        if response.question:
            response_dict["question"] = {
                "id": response.question.id,
                "scientific_text": response.question.scientific_text,
                "technological_text": response.question.technological_text,
                "type": response.question.type,
                "number_alternatives": response.question.number_alternatives
            }
        
        if response.assessment:
            response_dict["assessment"] = {
                "id": response.assessment.id,
                "evaluator_id": response.assessment.evaluator_id,
                "project_id": response.assessment.project_id
            }
        
        return ResponseDetailResponse(
            status=True,
            message="Resposta recuperada com sucesso",
            data=response_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar resposta: {str(e)}"
        )

@router.post("/", response_model=ResponseDetailResponse)
async def create_response(response_data: ResponseCreate, db: Session = Depends(get_db)):
    try:
        question = db.query(Question).filter(Question.id == response_data.question_id).first()
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pergunta não encontrada"
            )
        
        assessment = db.query(Assessment).filter(Assessment.id == response_data.assessment_id).first()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Avaliação não encontrada"
            )
        
        existing_response = db.query(Response).filter(
            Response.question_id == response_data.question_id,
            Response.assessment_id == response_data.assessment_id
        ).first()
        
        if existing_response:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma resposta para esta pergunta e avaliação"
            )
        
        response = Response(
            question_id=response_data.question_id,
            assessment_id=response_data.assessment_id,
            response=response_data.response,
            score=response_data.score
        )
        
        db.add(response)
        db.commit()
        db.refresh(response)
        
        response_dict = {
            "id": response.id,
            "question_id": response.question_id,
            "assessment_id": response.assessment_id,
            "response": response.response,
            "score": response.score,
            "created_at": response.created_at,
            "updated_at": response.updated_at,
            "deleted_at": response.deleted_at,
            "question": None,
            "assessment": None
        }
        
        if response.question:
            response_dict["question"] = {
                "id": response.question.id,
                "scientific_text": response.question.scientific_text,
                "technological_text": response.question.technological_text,
                "type": response.question.type,
                "number_alternatives": response.question.number_alternatives
            }
        
        if response.assessment:
            response_dict["assessment"] = {
                "id": response.assessment.id,
                "evaluator_id": response.assessment.evaluator_id,
                "project_id": response.assessment.project_id
            }
        
        return ResponseDetailResponse(
            status=True,
            message="Resposta criada com sucesso",
            data=response_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar resposta: {str(e)}"
        )

@router.put("/{response_id}", response_model=ResponseDetailResponse)
async def update_response(
    response_id: int,
    response_data: ResponseUpdate,
    db: Session = Depends(get_db)
):
    try:
        response = db.query(Response).filter(Response.id == response_id).first()
        
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resposta não encontrada"
            )
        
        if response_data.question_id and response_data.question_id != response.question_id:
            question = db.query(Question).filter(Question.id == response_data.question_id).first()
            if not question:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Pergunta não encontrada"
                )
        
        if response_data.assessment_id and response_data.assessment_id != response.assessment_id:
            assessment = db.query(Assessment).filter(Assessment.id == response_data.assessment_id).first()
            if not assessment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Avaliação não encontrada"
                )
        
        if response_data.question_id and response_data.assessment_id:
            existing_response = db.query(Response).filter(
                Response.question_id == response_data.question_id,
                Response.assessment_id == response_data.assessment_id,
                Response.id != response_id
            ).first()
            
            if existing_response:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Já existe uma resposta para esta pergunta e avaliação"
                )
        
        update_data = response_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(response, field, value)
        
        db.commit()
        db.refresh(response)
        
        response_dict = {
            "id": response.id,
            "question_id": response.question_id,
            "assessment_id": response.assessment_id,
            "response": response.response,
            "score": response.score,
            "created_at": response.created_at,
            "updated_at": response.updated_at,
            "deleted_at": response.deleted_at,
            "question": None,
            "assessment": None
        }
        
        if response.question:
            response_dict["question"] = {
                "id": response.question.id,
                "scientific_text": response.question.scientific_text,
                "technological_text": response.question.technological_text,
                "type": response.question.type,
                "number_alternatives": response.question.number_alternatives
            }
        
        if response.assessment:
            response_dict["assessment"] = {
                "id": response.assessment.id,
                "evaluator_id": response.assessment.evaluator_id,
                "project_id": response.assessment.project_id
            }
        
        return ResponseDetailResponse(
            status=True,
            message="Resposta atualizada com sucesso",
            data=response_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar resposta: {str(e)}"
        )

@router.delete("/{response_id}")
async def delete_response(response_id: int, db: Session = Depends(get_db)):
    try:
        response = db.query(Response).filter(Response.id == response_id).first()
        
        if not response:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resposta não encontrada"
            )
        
        from datetime import datetime
        response.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Resposta excluída com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir resposta: {str(e)}"
        ) 