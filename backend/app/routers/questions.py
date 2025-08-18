from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.question import Question
from app.schemas.question import (
    QuestionCreate, QuestionUpdate, QuestionListResponse, QuestionDetailResponse
)
from typing import Optional
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=QuestionListResponse)
async def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    year: Optional[int] = Query(None, description="Filter by year (defaults to current year)"),
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    try:
        filter_year = year if year is not None else datetime.now().year
        
        query = db.query(Question).filter(
            Question.deleted_at == None,
            Question.year == filter_year
        )
        
        if include_relations:
            query = query.options(
                joinedload(Question.responses),
                joinedload(Question.awards)
            )
        
        questions = query.offset(skip).limit(limit).all()
        
        question_data = []
        for question in questions:
            question_dict = {
                "id": question.id,
                "scientific_text": question.scientific_text,
                "technological_text": question.technological_text,
                "type": question.type,
                "number_alternatives": question.number_alternatives,
                "year": question.year,
                "created_at": question.created_at,
                "updated_at": question.updated_at,
                "deleted_at": question.deleted_at,
                "responses": [],
                "awards": []
            }
            
            if include_relations:
                question_dict["responses"] = [
                    {
                        "id": response.id,
                        "assessment_id": response.assessment_id,
                        "response": response.response,
                        "score": response.score
                    } for response in question.responses
                ]
                
                question_dict["awards"] = [
                    {
                        "id": award.id,
                        "name": award.name,
                        "description": award.description
                    } for award in question.awards
                ]
            
            question_data.append(question_dict)
        
        return QuestionListResponse(
            status=True,
            message=f"Questions retrieved successfully for year {filter_year}",
            data=question_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving questions: {str(e)}"
        )

@router.get("/{question_id}", response_model=QuestionDetailResponse)
async def get_question(
    question_id: int,
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Question).filter(Question.deleted_at == None)
        
        if include_relations:
            query = query.options(
                joinedload(Question.responses),
                joinedload(Question.awards)
            )
        
        question = query.filter(Question.id == question_id).first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        question_dict = {
            "id": question.id,
            "scientific_text": question.scientific_text,
            "technological_text": question.technological_text,
            "type": question.type,
            "number_alternatives": question.number_alternatives,
            "year": question.year,
            "created_at": question.created_at,
            "updated_at": question.updated_at,
            "deleted_at": question.deleted_at,
            "responses": [],
            "awards": []
        }
        
        if include_relations:
            question_dict["responses"] = [
                {
                    "id": response.id,
                    "assessment_id": response.assessment_id,
                    "response": response.response,
                    "score": response.score
                } for response in question.responses
            ]
            
            question_dict["awards"] = [
                {
                    "id": award.id,
                    "name": award.name,
                    "description": award.description
                } for award in question.awards
            ]
        
        return QuestionDetailResponse(
            status=True,
            message="Question retrieved successfully",
            data=question_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving question: {str(e)}"
        )

@router.post("/", response_model=QuestionDetailResponse)
async def create_question(question_data: QuestionCreate, db: Session = Depends(get_db)):
    try:
        question = Question(
            scientific_text=question_data.scientific_text,
            technological_text=question_data.technological_text,
            type=question_data.type,
            number_alternatives=question_data.number_alternatives,
            year=getattr(question_data, 'year', datetime.now().year)
        )
        
        db.add(question)
        db.commit()
        db.refresh(question)
        
        question_dict = {
            "id": question.id,
            "scientific_text": question.scientific_text,
            "technological_text": question.technological_text,
            "type": question.type,
            "number_alternatives": question.number_alternatives,
            "created_at": question.created_at,
            "updated_at": question.updated_at,
            "deleted_at": question.deleted_at,
            "responses": [],
            "awards": []
        }
        
        return QuestionDetailResponse(
            status=True,
            message="Question created successfully",
            data=question_dict
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating question: {str(e)}"
        )

@router.put("/{question_id}", response_model=QuestionDetailResponse)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_db)
):
    try:
        question = db.query(Question).filter(Question.id == question_id).first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        update_data = question_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(question, field, value)
        
        if not hasattr(question_data, 'year') or question_data.year is None:
            question.year = datetime.now().year
        
        db.commit()
        db.refresh(question)
        
        question_dict = {
            "id": question.id,
            "scientific_text": question.scientific_text,
            "technological_text": question.technological_text,
            "type": question.type,
            "number_alternatives": question.number_alternatives,
            "created_at": question.created_at,
            "updated_at": question.updated_at,
            "deleted_at": question.deleted_at,
            "responses": [],
            "awards": []
        }
        
        return QuestionDetailResponse(
            status=True,
            message="Question updated successfully",
            data=question_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating question: {str(e)}"
        )

@router.delete("/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(get_db)):
    try:
        question = db.query(Question).filter(Question.id == question_id).first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        question.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Question deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting question: {str(e)}"
        ) 