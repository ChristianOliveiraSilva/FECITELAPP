from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.evaluator import Evaluator
from app.models.user import User
from app.schemas.evaluator import (
    EvaluatorCreate, EvaluatorUpdate, EvaluatorListResponse, EvaluatorDetailResponse
)
from typing import Optional
import random
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=EvaluatorListResponse)
async def get_evaluators(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    year: Optional[int] = Query(None, description="Filter by year (defaults to current year)"),
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get all evaluators with optional pagination and relations"""
    try:
        filter_year = year if year is not None else datetime.now().year
        
        query = db.query(Evaluator).filter(
            Evaluator.deleted_at == None,
            Evaluator.year == filter_year
        )
        
        if include_relations:
            query = query.options(
                joinedload(Evaluator.user),
                joinedload(Evaluator.assessments),
                joinedload(Evaluator.categories)
            )
        
        evaluators = query.offset(skip).limit(limit).all()
        
        evaluator_data = []
        for evaluator in evaluators:
            evaluator_dict = {
                "id": evaluator.id,
                "user_id": evaluator.user_id,
                "PIN": evaluator.PIN,
                "year": evaluator.year,
                "created_at": evaluator.created_at,
                "updated_at": evaluator.updated_at,
                "deleted_at": evaluator.deleted_at,
                "user": None,
                "assessments": [],
                "categories": []
            }
            
            if include_relations:
                if evaluator.user:
                    evaluator_dict["user"] = {
                        "id": evaluator.user.id,
                        "name": evaluator.user.name,
                        "email": evaluator.user.email,
                        "active": evaluator.user.active
                    }
                
                evaluator_dict["assessments"] = [
                    {
                        "id": assessment.id,
                        "project_id": assessment.project_id,
                        "created_at": assessment.created_at
                    } for assessment in evaluator.assessments
                ]
                
                evaluator_dict["categories"] = [
                    {
                        "id": category.id,
                        "name": category.name
                    } for category in evaluator.categories
                ]
            
            evaluator_data.append(evaluator_dict)
        
        return EvaluatorListResponse(
            status=True,
            message=f"Evaluators retrieved successfully for year {filter_year}",
            data=evaluator_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving evaluators: {str(e)}"
        )

@router.get("/{evaluator_id}", response_model=EvaluatorDetailResponse)
async def get_evaluator(
    evaluator_id: int,
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get a specific evaluator by ID"""
    try:
        query = db.query(Evaluator).filter(Evaluator.deleted_at == None)
        
        if include_relations:
            query = query.options(
                joinedload(Evaluator.user),
                joinedload(Evaluator.assessments),
                joinedload(Evaluator.categories)
            )
        
        evaluator = query.filter(Evaluator.id == evaluator_id).first()
        
        if not evaluator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluator not found"
            )
        
        evaluator_dict = {
            "id": evaluator.id,
            "user_id": evaluator.user_id,
            "PIN": evaluator.PIN,
            "year": evaluator.year,
            "created_at": evaluator.created_at,
            "updated_at": evaluator.updated_at,
            "deleted_at": evaluator.deleted_at,
            "user": None,
            "assessments": [],
            "categories": []
        }
        
        if include_relations:
            if evaluator.user:
                evaluator_dict["user"] = {
                    "id": evaluator.user.id,
                    "name": evaluator.user.name,
                    "email": evaluator.user.email,
                    "active": evaluator.user.active
                }
            
            evaluator_dict["assessments"] = [
                {
                    "id": assessment.id,
                    "project_id": assessment.project_id,
                    "created_at": assessment.created_at
                } for assessment in evaluator.assessments
            ]
            
            evaluator_dict["categories"] = [
                {
                    "id": category.id,
                    "name": category.name
                } for category in evaluator.categories
            ]
        
        return EvaluatorDetailResponse(
            status=True,
            message="Evaluator retrieved successfully",
            data=evaluator_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving evaluator: {str(e)}"
        )

@router.post("/", response_model=EvaluatorDetailResponse)
async def create_evaluator(evaluator_data: EvaluatorCreate, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == evaluator_data.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )
        
        existing_evaluator = db.query(Evaluator).filter(Evaluator.user_id == evaluator_data.user_id).first()
        if existing_evaluator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an evaluator profile"
            )
        
        pin = evaluator_data.PIN
        if not pin:
            while True:
                pin = str(random.randint(1111, 9999))
                existing_pin = db.query(Evaluator).filter(Evaluator.PIN == pin).first()
                if not existing_pin:
                    break
        
        evaluator = Evaluator(
            user_id=evaluator_data.user_id,
            PIN=pin,
            year=getattr(evaluator_data, 'year', datetime.now().year)
        )
        
        db.add(evaluator)
        db.commit()
        db.refresh(evaluator)
        
        evaluator_dict = {
            "id": evaluator.id,
            "user_id": evaluator.user_id,
            "PIN": evaluator.PIN,
            "created_at": evaluator.created_at,
            "updated_at": evaluator.updated_at,
            "deleted_at": evaluator.deleted_at,
            "user": None,
            "assessments": [],
            "categories": []
        }
        
        return EvaluatorDetailResponse(
            status=True,
            message="Evaluator created successfully",
            data=evaluator_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating evaluator: {str(e)}"
        )

@router.put("/{evaluator_id}", response_model=EvaluatorDetailResponse)
async def update_evaluator(
    evaluator_id: int,
    evaluator_data: EvaluatorUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing evaluator"""
    try:
        evaluator = db.query(Evaluator).filter(Evaluator.id == evaluator_id).first()
        
        if not evaluator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluator not found"
            )
        
        if evaluator_data.user_id and evaluator_data.user_id != evaluator.user_id:
            user = db.query(User).filter(User.id == evaluator_data.user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User not found"
                )
            
            existing_evaluator = db.query(Evaluator).filter(
                Evaluator.user_id == evaluator_data.user_id,
                Evaluator.id != evaluator_id
            ).first()
            if existing_evaluator:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User already has an evaluator profile"
                )
        
        if evaluator_data.PIN and evaluator_data.PIN != evaluator.PIN:
            existing_pin = db.query(Evaluator).filter(
                Evaluator.PIN == evaluator_data.PIN,
                Evaluator.id != evaluator_id
            ).first()
            if existing_pin:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PIN already exists"
                )
        
        update_data = evaluator_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(evaluator, field, value)
        
        if not hasattr(evaluator_data, 'year') or evaluator_data.year is None:
            evaluator.year = datetime.now().year
        
        db.commit()
        db.refresh(evaluator)
        
        evaluator_dict = {
            "id": evaluator.id,
            "user_id": evaluator.user_id,
            "PIN": evaluator.PIN,
            "created_at": evaluator.created_at,
            "updated_at": evaluator.updated_at,
            "deleted_at": evaluator.deleted_at,
            "user": None,
            "assessments": [],
            "categories": []
        }
        
        return EvaluatorDetailResponse(
            status=True,
            message="Evaluator updated successfully",
            data=evaluator_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating evaluator: {str(e)}"
        )

@router.delete("/{evaluator_id}")
async def delete_evaluator(evaluator_id: int, db: Session = Depends(get_db)):
    try:
        evaluator = db.query(Evaluator).filter(Evaluator.id == evaluator_id).first()
        
        if not evaluator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evaluator not found"
            )
        
        evaluator.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Evaluator deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting evaluator: {str(e)}"
        ) 