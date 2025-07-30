from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.award import Award
from app.schemas.award import (
    AwardCreate, AwardUpdate, AwardListResponse, AwardDetailResponse
)
from typing import Optional

router = APIRouter()

@router.get("/", response_model=AwardListResponse)
async def get_awards(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get all awards with optional pagination and relations"""
    try:
        query = db.query(Award)
        
        if include_relations:
            query = query.options(joinedload(Award.questions))
        
        awards = query.offset(skip).limit(limit).all()
        
        award_data = []
        for award in awards:
            award_dict = {
                "id": award.id,
                "name": award.name,
                "description": award.description,
                "created_at": award.created_at,
                "updated_at": award.updated_at,
                "deleted_at": award.deleted_at,
                "questions": []
            }
            
            if include_relations:
                award_dict["questions"] = [
                    {
                        "id": question.id,
                        "scientific_text": question.scientific_text,
                        "technological_text": question.technological_text,
                        "type": question.type,
                        "number_alternatives": question.number_alternatives
                    } for question in award.questions
                ]
            
            award_data.append(award_dict)
        
        return AwardListResponse(
            status=True,
            message="Awards retrieved successfully",
            data=award_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving awards: {str(e)}"
        )

@router.get("/{award_id}", response_model=AwardDetailResponse)
async def get_award(
    award_id: int,
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get a specific award by ID"""
    try:
        query = db.query(Award)
        
        if include_relations:
            query = query.options(joinedload(Award.questions))
        
        award = query.filter(Award.id == award_id).first()
        
        if not award:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Award not found"
            )
        
        award_dict = {
            "id": award.id,
            "name": award.name,
            "description": award.description,
            "created_at": award.created_at,
            "updated_at": award.updated_at,
            "deleted_at": award.deleted_at,
            "questions": []
        }
        
        if include_relations:
            award_dict["questions"] = [
                {
                    "id": question.id,
                    "scientific_text": question.scientific_text,
                    "technological_text": question.technological_text,
                    "type": question.type,
                    "number_alternatives": question.number_alternatives
                } for question in award.questions
            ]
        
        return AwardDetailResponse(
            status=True,
            message="Award retrieved successfully",
            data=award_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving award: {str(e)}"
        )

@router.post("/", response_model=AwardDetailResponse)
async def create_award(award_data: AwardCreate, db: Session = Depends(get_db)):
    """Create a new award"""
    try:
        award = Award(
            name=award_data.name,
            description=award_data.description
        )
        
        db.add(award)
        db.commit()
        db.refresh(award)
        
        award_dict = {
            "id": award.id,
            "name": award.name,
            "description": award.description,
            "created_at": award.created_at,
            "updated_at": award.updated_at,
            "deleted_at": award.deleted_at,
            "questions": []
        }
        
        return AwardDetailResponse(
            status=True,
            message="Award created successfully",
            data=award_dict
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating award: {str(e)}"
        )

@router.put("/{award_id}", response_model=AwardDetailResponse)
async def update_award(
    award_id: int,
    award_data: AwardUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing award"""
    try:
        award = db.query(Award).filter(Award.id == award_id).first()
        
        if not award:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Award not found"
            )
        
        # Update fields
        update_data = award_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(award, field, value)
        
        db.commit()
        db.refresh(award)
        
        award_dict = {
            "id": award.id,
            "name": award.name,
            "description": award.description,
            "created_at": award.created_at,
            "updated_at": award.updated_at,
            "deleted_at": award.deleted_at,
            "questions": []
        }
        
        return AwardDetailResponse(
            status=True,
            message="Award updated successfully",
            data=award_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating award: {str(e)}"
        )

@router.delete("/{award_id}")
async def delete_award(award_id: int, db: Session = Depends(get_db)):
    """Soft delete an award"""
    try:
        award = db.query(Award).filter(Award.id == award_id).first()
        
        if not award:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Award not found"
            )
        
        # Soft delete
        from datetime import datetime
        award.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Award deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting award: {str(e)}"
        ) 