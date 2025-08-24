from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.project import Project
from app.models.category import Category
from app.schemas.project import (
    ProjectListResponse, ProjectDetailResponse
)
from typing import Optional
from datetime import datetime
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads/projects"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    file_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{upload_file.filename}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return os.path.join(UPLOAD_DIR, file_name)

@router.get("/", response_model=ProjectListResponse)
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    year: Optional[int] = Query(None, description="Filtrar por ano (padrão: ano atual)"),
    db: Session = Depends(get_db)
):
    try:
        filter_year = year if year is not None else datetime.now().year
        
        query = (
            db.query(Project)
            .filter(
                Project.deleted_at == None,
                Project.year == filter_year
            )
            .options(
                joinedload(Project.category),
                joinedload(Project.students),
                joinedload(Project.assessments)
            )
        )
        
        projects = query.offset(skip).limit(limit).all()
        
        project_data = []
        for project in projects:
            project_dict = {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "year": project.year,
                "category_id": project.category_id,
                "projectType": project.projectType,
                "external_id": project.external_id,
                "file": project.file,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "deleted_at": project.deleted_at,
                "category": None,
                "students": [],
                "assessments": []
            }
            
            if project.category:
                project_dict["category"] = {
                    "id": project.category.id,
                    "name": project.category.name
                }
            
            project_dict["students"] = [
                {
                    "id": student.id,
                    "name": student.name,
                    "school_grade": student.school_grade,
                    "year": student.year,
                    "school_id": student.school_id
                } for student in project.students
            ]
            
            project_dict["assessments"] = [
                {
                    "id": assessment.id,
                    "evaluator_id": assessment.evaluator_id,
                    "created_at": assessment.created_at
                } for assessment in project.assessments
            ]
            
            project_data.append(project_dict)
        
        return ProjectListResponse(
            status=True,
            message=f"Projetos recuperados com sucesso para o ano {filter_year}",
            data=project_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar projetos: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Project).filter(Project.deleted_at == None).options(
            joinedload(Project.category),
            joinedload(Project.students),
            joinedload(Project.assessments)
        )
        
        project = query.filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Projeto não encontrado"
            )
        
        project_dict = {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "year": project.year,
            "category_id": project.category_id,
            "projectType": project.projectType,
            "external_id": project.external_id,
            "file": project.file,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "deleted_at": project.deleted_at,
            "category": None,
            "students": [],
            "assessments": []
        }
        
        if project.category:
            project_dict["category"] = {
                "id": project.category.id,
                "name": project.category.name
            }
        
        project_dict["students"] = [
            {
                "id": student.id,
                "name": student.name,
                "school_grade": student.school_grade,
                "year": student.year,
                "school_id": student.school_id
            } for student in project.students
        ]
        
        project_dict["assessments"] = [
            {
                "id": assessment.id,
                "evaluator_id": assessment.evaluator_id,
                "created_at": assessment.created_at
            } for assessment in project.assessments
        ]
        
        return ProjectDetailResponse(
            status=True,
            message="Projeto recuperado com sucesso",
            data=project_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar projeto: {str(e)}"
        )

@router.post("/", response_model=ProjectDetailResponse)
async def create_project(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    year: int = Form(...),
    category_id: int = Form(...),
    projectType: int = Form(...),
    external_id: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categoria não encontrada"
            )
        
        file_name = None
        if file:
            file_name = await save_upload_file(file)
        
        project = Project(
            title=title,
            description=description,
            year=year,
            category_id=category_id,
            projectType=projectType,
            external_id=external_id,
            file=file_name
        )
        
        db.add(project)
        db.commit()
        db.refresh(project)
        
        project_dict = {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "year": project.year,
            "category_id": project.category_id,
            "projectType": project.projectType,
            "external_id": project.external_id,
            "file": project.file,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "deleted_at": project.deleted_at,
            "category": None,
            "students": [],
            "assessments": []
        }
        
        return ProjectDetailResponse(
            status=True,
            message="Projeto criado com sucesso",
            data=project_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar projeto: {str(e)}"
        )

@router.put("/{project_id}", response_model=ProjectDetailResponse)
async def update_project(
    project_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    year: Optional[int] = Form(None),
    category_id: Optional[int] = Form(None),
    projectType: Optional[int] = Form(None),
    external_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Projeto não encontrado"
            )
        
        if category_id and category_id != project.category_id:
            category = db.query(Category).filter(Category.id == category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria não encontrada"
                )
        
        if file:
            file_name = await save_upload_file(file)
            project.file = file_name
        
        if title is not None:
            project.title = title
        if description is not None:
            project.description = description
        if year is not None:
            project.year = year
        if category_id is not None:
            project.category_id = category_id
        if projectType is not None:
            project.projectType = projectType
        if external_id is not None:
            project.external_id = external_id
        
        db.commit()
        db.refresh(project)
        
        project_dict = {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "year": project.year,
            "category_id": project.category_id,
            "projectType": project.projectType,
            "external_id": project.external_id,
            "file": project.file,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "deleted_at": project.deleted_at,
            "category": None,
            "students": [],
            "assessments": []
        }
        
        return ProjectDetailResponse(
            status=True,
            message="Projeto atualizado com sucesso",
            data=project_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar projeto: {str(e)}"
        )

@router.delete("/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Projeto não encontrado"
            )
        
        project.deleted_at = datetime.utcnow()
        db.commit()
        
        return {
            "status": True,
            "message": "Projeto excluído com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir projeto: {str(e)}"
        ) 