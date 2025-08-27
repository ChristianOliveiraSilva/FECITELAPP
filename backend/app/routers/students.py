from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
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
import csv
import io
import pandas as pd
import os
import tempfile

router = APIRouter()

@router.get("/", response_model=StudentListResponse)
async def get_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    year: Optional[int] = Query(None, description="Filter by year (defaults to current year)"),
    db: Session = Depends(get_db)
):
    try:
        filter_year = year if year is not None else datetime.now().year
        
        query = db.query(Student).filter(
            Student.deleted_at == None,
            Student.year == filter_year
        ).options(
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
            detail=f"Erro ao recuperar estudantes: {str(e)}"
        )

@router.get("/{student_id}", response_model=StudentDetailResponse)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Student).filter(Student.deleted_at == None).options(
            joinedload(Student.school),
            joinedload(Student.projects)
        )
        
        student = query.filter(Student.id == student_id).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudante não encontrado"
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
            message="Estudante recuperado com sucesso",
            data=student_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar estudante: {str(e)}"
        )

@router.post("/", response_model=StudentDetailResponse)
async def create_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    try:
        school = db.query(School).filter(School.id == student_data.school_id).first()
        if not school:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Escola não encontrada"
            )
        
        school_grade_value = None
        for grade_value, grade_label in SchoolGrade.get_values().items():
            if grade_label == student_data.school_grade:
                school_grade_value = grade_value
                break
        
        if school_grade_value is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Série escolar inválida"
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
            "year": student.year,
            "school": None,
            "projects": []
        }
        
        if student.school:
            student_dict["school"] = {
                "id": student.school.id,
                "name": student.school.name
            }
        
        if student.projects:
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
            message="Estudante criado com sucesso",
            data=student_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar estudante: {str(e)}"
        )

@router.put("/{student_id}", response_model=StudentDetailResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db)
):
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudante não encontrado"
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
                    detail="Série escolar inválida"
                )
            
            student.school_grade = school_grade_value
        
        if student_data.year is not None:
            student.year = student_data.year
        
        if student_data.school_id is not None:
            school = db.query(School).filter(School.id == student_data.school_id).first()
            if not school:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Escola não encontrada"
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
            "year": student.year,
            "created_at": student.created_at,
            "updated_at": student.updated_at,
            "deleted_at": student.deleted_at,
            "school": None,
            "projects": []
        }
        
        if student.school:
            student_dict["school"] = {
                "id": student.school.id,
                "name": student.school.name
            }
        
        if student.projects:
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
            message="Estudante atualizado com sucesso",
            data=student_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar estudante: {str(e)}"
        )

@router.delete("/{student_id}")
async def delete_student(student_id: int, db: Session = Depends(get_db)):
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudante não encontrado"
            )
        
        student.deleted_at = datetime.utcnow()
        db.commit()
        
        return {
            "status": True,
            "message": "Estudante excluído com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir estudante: {str(e)}"
        ) 

@router.get("/export/csv")
async def export_students_csv(
    db: Session = Depends(get_db)
):
    """Exporta todos os estudantes para CSV"""
    try:
        students = db.query(Student).filter(Student.deleted_at == None).all()
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalhos
        headers = ["id", "name", "email", "school_grade", "year", "school_id", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for student in students:
            school_grade_enum = SchoolGrade(student.school_grade)
            school_grade_label = school_grade_enum.get_label()
            
            writer.writerow([
                student.id,
                student.name,
                student.email or "",
                school_grade_label,
                student.year,
                student.school_id,
                student.created_at.isoformat() if student.created_at else "",
                student.updated_at.isoformat() if student.updated_at else "",
                student.deleted_at.isoformat() if student.deleted_at else ""
            ])
        
        temp_file.close()
        
        return FileResponse(
            path=temp_file.name,
            filename="students_export.csv",
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar estudantes: {str(e)}"
        )

@router.get("/import/molde")
async def download_student_molde():
    """Download do arquivo molde para estudantes"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/student.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="student_molde.csv",
            media_type="text/csv"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao baixar molde: {str(e)}"
        )

@router.post("/import")
async def import_students_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa estudantes de um arquivo CSV"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Arquivo deve ser um CSV"
            )
        
        # Ler o arquivo CSV
        content = await file.read()
        csv_text = content.decode('utf-8')
        
        # Usar pandas para ler o CSV
        df = pd.read_csv(io.StringIO(csv_text))
        
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Verificar se a escola existe
                school = db.query(School).filter(School.id == row['school_id']).first()
                if not school:
                    errors.append(f"Linha {index + 2}: Escola com ID {row['school_id']} não encontrada")
                    continue
                
                # Converter série escolar
                school_grade_value = None
                for grade_value, grade_label in SchoolGrade.get_values().items():
                    if grade_label == row['school_grade']:
                        school_grade_value = grade_value
                        break
                
                if school_grade_value is None:
                    errors.append(f"Linha {index + 2}: Série escolar inválida: {row['school_grade']}")
                    continue
                
                # Criar novo estudante
                student = Student(
                    name=row['name'],
                    email=row.get('email'),
                    school_grade=school_grade_value,
                    year=row.get('year', datetime.now().year),
                    school_id=row['school_id']
                )
                
                db.add(student)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} estudantes importados.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar estudantes: {str(e)}"
        ) 