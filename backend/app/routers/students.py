from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.student import Student
from app.models.school import School
from app.schemas.student import (
    StudentCreate, StudentUpdate, StudentListResponse, StudentDetailResponse
)
from app.enums.school_grade import SchoolGrade
from typing import Optional
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=StudentListResponse)
async def get_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    year: Optional[int] = Query(None, description="Filter by year (defaults to current year)"),
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    try:
        filter_year = year if year is not None else datetime.now().year
        
        query = db.query(Student).filter(
            Student.deleted_at == None,
            Student.year == filter_year
        )
        
        if include_relations:
            query = query.options(
                joinedload(Student.school),
                joinedload(Student.projects)
            )
        
        students = query.offset(skip).limit(limit).all()
        
        student_data = []
        for student in students:
            school_grade_enum = SchoolGrade(student.school_grade)
            school_grade_label = school_grade_enum.get_label()
            
            student_dict = {
                "id": student.id,
                "name": student.name,
                "email": student.email,
                "school_grade": school_grade_label,
                "year": student.year,
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
            message=f"Students retrieved successfully for year {filter_year}",
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
        query = db.query(Student).filter(Student.deleted_at == None)
        
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
        
        school_grade_enum = SchoolGrade(student.school_grade)
        school_grade_label = school_grade_enum.get_label()
        
        student_dict = {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "school_grade": school_grade_label,
            "year": student.year,
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
    try:
        school = db.query(School).filter(School.id == student_data.school_id).first()
        if not school:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="School not found"
            )
        
        school_grade_value = None
        for grade_value, grade_label in SchoolGrade.get_values().items():
            if grade_label == student_data.school_grade:
                school_grade_value = grade_value
                break
        
        if school_grade_value is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid school grade"
            )
        
        student = Student(
            name=student_data.name,
            email=student_data.email,
            school_grade=school_grade_value,
            year=getattr(student_data, 'year', datetime.now().year),
            school_id=student_data.school_id
        )
        
        db.add(student)
        db.commit()
        db.refresh(student)
        
        school_grade_enum = SchoolGrade(student.school_grade)
        school_grade_label = school_grade_enum.get_label()
        
        student_dict = {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "school_grade": school_grade_label,
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
        
        if student_data.name is not None:
            student.name = student_data.name
        
        if student_data.email is not None:
            student.email = student_data.email
        
        if student_data.school_grade is not None:
            school_grade_value = None
            for grade_value, grade_label in SchoolGrade.get_values().items():
                if grade_label == student_data.school_grade:
                    school_grade_value = grade_value
                    break
            
            if school_grade_value is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid school grade"
                )
            
            student.school_grade = school_grade_value
        
        if student_data.year is not None:
            student.year = student_data.year
        
        if student_data.school_id is not None:
            school = db.query(School).filter(School.id == student_data.school_id).first()
            if not school:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="School not found"
                )
            student.school_id = student_data.school_id
        
        db.commit()
        db.refresh(student)
        
        school_grade_enum = SchoolGrade(student.school_grade)
        school_grade_label = school_grade_enum.get_label()
        
        student_dict = {
            "id": student.id,
            "name": student.name,
            "email": student.email,
            "school_grade": school_grade_label,
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
    """Delete a student (soft delete)"""
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
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