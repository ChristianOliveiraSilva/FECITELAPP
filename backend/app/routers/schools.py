from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.school import School
from app.schemas.school import (
    SchoolCreate, SchoolUpdate, SchoolListResponse, SchoolDetailResponse
)
from typing import Optional

router = APIRouter()

@router.get("/", response_model=SchoolListResponse)
async def get_schools(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(School).filter(School.deleted_at == None).options(joinedload(School.students))
        
        schools = query.offset(skip).limit(limit).all()
        
        school_data = []
        for school in schools:
            school_dict = {
                "id": school.id,
                "name": school.name,
                "city": school.city,
                "state": school.state,
                "created_at": school.created_at,
                "updated_at": school.updated_at,
                "deleted_at": school.deleted_at,
                "students": []
            }
            
            school_dict["students"] = [
                {
                    "id": student.id,
                    "name": student.name,
                    "school_grade": student.school_grade,
                    "created_at": student.created_at
                } for student in school.students
            ]
            
            school_data.append(school_dict)
        
        return SchoolListResponse(
            status=True,
            message="Schools retrieved successfully",
            data=school_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving schools: {str(e)}"
        )

@router.get("/{school_id}", response_model=SchoolDetailResponse)
async def get_school(
    school_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(School).filter(School.deleted_at == None).options(joinedload(School.students))

        school = query.filter(School.id == school_id).first()

        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        school_dict = {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "created_at": school.created_at,
            "updated_at": school.updated_at,
            "deleted_at": school.deleted_at,
            "students": []
        }
        
        school_dict["students"] = [
            {
                "id": student.id,
                "name": student.name,
                "school_grade": student.school_grade,
                "created_at": student.created_at
            } for student in school.students
        ]
    
        return SchoolDetailResponse(
            status=True,
            message="School retrieved successfully",
            data=school_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving school: {str(e)}"
        )

@router.post("/", response_model=SchoolDetailResponse)
async def create_school(school_data: SchoolCreate, db: Session = Depends(get_db)):
    try:
        school = School(name=school_data.name, city=school_data.city, state=school_data.state)
        
        db.add(school)
        db.commit()
        db.refresh(school)
        
        school_dict = {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "created_at": school.created_at,
            "updated_at": school.updated_at,
            "deleted_at": school.deleted_at,
            "students": []
        }
        
        school_dict["students"] = [
            {
                "id": student.id,
                "name": student.name,
                "school_grade": student.school_grade,
                "created_at": student.created_at
            } for student in school.students
        ]

        return SchoolDetailResponse(
            status=True,
            message="School created successfully",
            data=school_dict
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating school: {str(e)}"
        )

@router.put("/{school_id}", response_model=SchoolDetailResponse)
async def update_school(
    school_id: int,
    school_data: SchoolUpdate,
    db: Session = Depends(get_db)
):
    try:
        school = db.query(School).filter(School.id == school_id).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        update_data = school_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(school, field, value)
        
        db.commit()
        db.refresh(school)
        
        school_dict = {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "created_at": school.created_at,
            "updated_at": school.updated_at,
            "deleted_at": school.deleted_at,
            "students": []
        }
        
        school_dict["students"] = [
            {
                "id": student.id,
                "name": student.name,
                "school_grade": student.school_grade,
                "created_at": student.created_at
            } for student in school.students
        ]
        
        return SchoolDetailResponse(
            status=True,
            message="School updated successfully",
            data=school_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating school: {str(e)}"
        )

@router.delete("/{school_id}")
async def delete_school(school_id: int, db: Session = Depends(get_db)):
    try:
        school = db.query(School).filter(School.id == school_id).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        from datetime import datetime
        school.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "School deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting school: {str(e)}"
        ) 