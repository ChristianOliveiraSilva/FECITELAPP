from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.student import Student
from app.models.school import School
from app.schemas.student import (
    StudentCreate, StudentUpdate, StudentListResponse, StudentDetailResponse
)
from typing import Optional

router = APIRouter()

@router.get("/", response_model=StudentListResponse)
async def get_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get all students with optional pagination and relations"""
    try:
        query = db.query(Student)
        
        if include_relations:
            query = query.options(
                joinedload(Student.school),
                joinedload(Student.projects)
            )
        
        students = query.offset(skip).limit(limit).all()
        
        student_data = []
        for student in students:
            student_dict = {
                "id": student.id,
                "name": student.name,
                "school_grade": student.school_grade,
                "school_id": student.school_id,
                "created_at": student.created_at,
                "updated_at": student.updated_at,
                "deleted_at": student.deleted_at,
                "school": None,
                "projects": []
            }
            
            if include_relations:
                if student.school:
                    student_dict["school"] = {
                        "id": student.school.id,
                        "name": student.school.name
                    }
                
                student_dict["projects"] = [
                    {
                        "id": project.id,
                        "title": project.title,
                        "year": project.year,
                        "category_id": project.category_id
                    } for project in student.projects
                ]
            
            student_data.append(student_dict)
        
        return StudentListResponse(
            status=True,
            message="Students retrieved successfully",
            data=student_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving students: {str(e)}"
        )

@router.get("/{student_id}", response_model=StudentDetailResponse)
async def get_student(
    student_id: int,
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get a specific student by ID"""
    try:
        query = db.query(Student)
        
        if include_relations:
            query = query.options(
                joinedload(Student.school),
                joinedload(Student.projects)
            )
        
        student = query.filter(Student.id == student_id).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        student_dict = {
            "id": student.id,
            "name": student.name,
            "school_grade": student.school_grade,
            "school_id": student.school_id,
            "created_at": student.created_at,
            "updated_at": student.updated_at,
            "deleted_at": student.deleted_at,
            "school": None,
            "projects": []
        }
        
        if include_relations:
            if student.school:
                student_dict["school"] = {
                    "id": student.school.id,
                    "name": student.school.name
                }
            
            student_dict["projects"] = [
                {
                    "id": project.id,
                    "title": project.title,
                    "year": project.year,
                    "category_id": project.category_id
                } for project in student.projects
            ]
        
        return StudentDetailResponse(
            status=True,
            message="Student retrieved successfully",
            data=student_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving student: {str(e)}"
        )

@router.post("/", response_model=StudentDetailResponse)
async def create_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    """Create a new student"""
    try:
        # Check if school exists
        school = db.query(School).filter(School.id == student_data.school_id).first()
        if not school:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="School not found"
            )
        
        student = Student(
            name=student_data.name,
            school_grade=student_data.school_grade,
            school_id=student_data.school_id
        )
        
        db.add(student)
        db.commit()
        db.refresh(student)
        
        student_dict = {
            "id": student.id,
            "name": student.name,
            "school_grade": student.school_grade,
            "school_id": student.school_id,
            "created_at": student.created_at,
            "updated_at": student.updated_at,
            "deleted_at": student.deleted_at,
            "school": None,
            "projects": []
        }
        
        return StudentDetailResponse(
            status=True,
            message="Student created successfully",
            data=student_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating student: {str(e)}"
        )

@router.put("/{student_id}", response_model=StudentDetailResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing student"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        # Check if school exists if school_id is being updated
        if student_data.school_id and student_data.school_id != student.school_id:
            school = db.query(School).filter(School.id == student_data.school_id).first()
            if not school:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="School not found"
                )
        
        # Update fields
        update_data = student_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(student, field, value)
        
        db.commit()
        db.refresh(student)
        
        student_dict = {
            "id": student.id,
            "name": student.name,
            "school_grade": student.school_grade,
            "school_id": student.school_id,
            "created_at": student.created_at,
            "updated_at": student.updated_at,
            "deleted_at": student.deleted_at,
            "school": None,
            "projects": []
        }
        
        return StudentDetailResponse(
            status=True,
            message="Student updated successfully",
            data=student_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating student: {str(e)}"
        )

@router.delete("/{student_id}")
async def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Soft delete a student"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        # Soft delete
        from datetime import datetime
        student.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Student deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting student: {str(e)}"
        ) 