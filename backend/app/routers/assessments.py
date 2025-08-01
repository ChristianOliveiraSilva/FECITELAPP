from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.assessment import Assessment
from app.models.evaluator import Evaluator
from app.models.project import Project
from app.schemas.assessment import (
    AssessmentCreate, AssessmentUpdate, AssessmentListResponse, AssessmentDetailResponse
)
from typing import Optional

router = APIRouter()

@router.get("/", response_model=AssessmentListResponse)
async def get_assessments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get all assessments with optional pagination and relations"""
    try:
        query = db.query(Assessment)
        
        if include_relations:
            query = query.options(
                joinedload(Assessment.evaluator),
                joinedload(Assessment.project),
                joinedload(Assessment.responses)
            )
        
        assessments = query.offset(skip).limit(limit).all()
        
        assessment_data = []
        for assessment in assessments:
            assessment_dict = {
                "id": assessment.id,
                "evaluator_id": assessment.evaluator_id,
                "project_id": assessment.project_id,
                "created_at": assessment.created_at,
                "updated_at": assessment.updated_at,
                "deleted_at": assessment.deleted_at,
                "evaluator": None,
                "project": None,
                "responses": []
            }
            
            if include_relations:
                if assessment.evaluator:
                    assessment_dict["evaluator"] = {
                        "id": assessment.evaluator.id,
                        "PIN": assessment.evaluator.PIN,
                        "user_id": assessment.evaluator.user_id
                    }
                
                if assessment.project:
                    assessment_dict["project"] = {
                        "id": assessment.project.id,
                        "title": assessment.project.title,
                        "year": assessment.project.year,
                        "category_id": assessment.project.category_id
                    }
                
                assessment_dict["responses"] = [
                    {
                        "id": response.id,
                        "question_id": response.question_id,
                        "response": response.response,
                        "score": response.score
                    } for response in assessment.responses
                ]
            
            assessment_data.append(assessment_dict)
        
        return AssessmentListResponse(
            status=True,
            message="Assessments retrieved successfully",
            data=assessment_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving assessments: {str(e)}"
        )

@router.get("/{assessment_id}", response_model=AssessmentDetailResponse)
async def get_assessment(
    assessment_id: int,
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get a specific assessment by ID"""
    try:
        query = db.query(Assessment)
        
        if include_relations:
            query = query.options(
                joinedload(Assessment.evaluator),
                joinedload(Assessment.project),
                joinedload(Assessment.responses)
            )
        
        assessment = query.filter(Assessment.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        
        assessment_dict = {
            "id": assessment.id,
            "evaluator_id": assessment.evaluator_id,
            "project_id": assessment.project_id,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
            "deleted_at": assessment.deleted_at,
            "evaluator": None,
            "project": None,
            "responses": []
        }
        
        if include_relations:
            if assessment.evaluator:
                assessment_dict["evaluator"] = {
                    "id": assessment.evaluator.id,
                    "PIN": assessment.evaluator.PIN,
                    "user_id": assessment.evaluator.user_id
                }
            
            if assessment.project:
                assessment_dict["project"] = {
                    "id": assessment.project.id,
                    "title": assessment.project.title,
                    "year": assessment.project.year,
                    "category_id": assessment.project.category_id
                }
            
            assessment_dict["responses"] = [
                {
                    "id": response.id,
                    "question_id": response.question_id,
                    "response": response.response,
                    "score": response.score
                } for response in assessment.responses
            ]
        
        return AssessmentDetailResponse(
            status=True,
            message="Assessment retrieved successfully",
            data=assessment_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving assessment: {str(e)}"
        )

@router.post("/", response_model=AssessmentDetailResponse)
async def create_assessment(assessment_data: AssessmentCreate, db: Session = Depends(get_db)):
    """Create a new assessment"""
    try:
        # Check if evaluator exists
        evaluator = db.query(Evaluator).filter(Evaluator.id == assessment_data.evaluator_id).first()
        if not evaluator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Evaluator not found"
            )
        
        # Check if project exists
        project = db.query(Project).filter(Project.id == assessment_data.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Project not found"
            )
        
        # Check if assessment already exists for this evaluator and project
        existing_assessment = db.query(Assessment).filter(
            Assessment.evaluator_id == assessment_data.evaluator_id,
            Assessment.project_id == assessment_data.project_id
        ).first()
        
        if existing_assessment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assessment already exists for this evaluator and project"
            )
        
        assessment = Assessment(
            evaluator_id=assessment_data.evaluator_id,
            project_id=assessment_data.project_id
        )
        
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        assessment_dict = {
            "id": assessment.id,
            "evaluator_id": assessment.evaluator_id,
            "project_id": assessment.project_id,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
            "deleted_at": assessment.deleted_at,
            "evaluator": None,
            "project": None,
            "responses": []
        }
        
        return AssessmentDetailResponse(
            status=True,
            message="Assessment created successfully",
            data=assessment_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating assessment: {str(e)}"
        )

@router.put("/{assessment_id}", response_model=AssessmentDetailResponse)
async def update_assessment(
    assessment_id: int,
    assessment_data: AssessmentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing assessment"""
    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        
        # Check if evaluator exists if evaluator_id is being updated
        if assessment_data.evaluator_id and assessment_data.evaluator_id != assessment.evaluator_id:
            evaluator = db.query(Evaluator).filter(Evaluator.id == assessment_data.evaluator_id).first()
            if not evaluator:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Evaluator not found"
                )
        
        # Check if project exists if project_id is being updated
        if assessment_data.project_id and assessment_data.project_id != assessment.project_id:
            project = db.query(Project).filter(Project.id == assessment_data.project_id).first()
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Project not found"
                )
        
        # Check for duplicate assessment if both evaluator_id and project_id are being updated
        if assessment_data.evaluator_id and assessment_data.project_id:
            existing_assessment = db.query(Assessment).filter(
                Assessment.evaluator_id == assessment_data.evaluator_id,
                Assessment.project_id == assessment_data.project_id,
                Assessment.id != assessment_id
            ).first()
            
            if existing_assessment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assessment already exists for this evaluator and project"
                )
        
        # Update fields
        update_data = assessment_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(assessment, field, value)
        
        db.commit()
        db.refresh(assessment)
        
        assessment_dict = {
            "id": assessment.id,
            "evaluator_id": assessment.evaluator_id,
            "project_id": assessment.project_id,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
            "deleted_at": assessment.deleted_at,
            "evaluator": None,
            "project": None,
            "responses": []
        }
        
        return AssessmentDetailResponse(
            status=True,
            message="Assessment updated successfully",
            data=assessment_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating assessment: {str(e)}"
        )

@router.delete("/{assessment_id}")
async def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Soft delete an assessment"""
    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assessment not found"
            )
        
        # Soft delete
        from datetime import datetime
        assessment.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Assessment deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting assessment: {str(e)}"
        ) 