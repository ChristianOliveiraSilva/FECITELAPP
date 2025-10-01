from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
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
import csv
import io
import pandas as pd
import tempfile
from sqlalchemy import and_

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
    title: Optional[str] = Query(None, description="Filter by project title"),
    description: Optional[str] = Query(None, description="Filter by project description"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    projectType: Optional[int] = Query(None, description="Filter by project type"),
    external_id: Optional[str] = Query(None, description="Filter by external ID"),
    db: Session = Depends(get_db)
):
    try:
        filter_year = year if year is not None else datetime.now().year
        
        # Construir filtros dinâmicos
        filters = [
            Project.deleted_at == None,
            Project.year == filter_year
        ]
        
        if title:
            filters.append(Project.title.ilike(f"%{title}%"))
        
        if description:
            filters.append(Project.description.ilike(f"%{description}%"))
        
        if category_id:
            filters.append(Project.category_id == category_id)
        
        if projectType is not None:
            filters.append(Project.projectType == projectType)
        
        if external_id:
            filters.append(Project.external_id.ilike(f"%{external_id}%"))
        
        query = (
            db.query(Project)
            .filter(and_(*filters))
            .options(
                joinedload(Project.category),
                joinedload(Project.students),
                joinedload(Project.supervisors),
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
                "supervisors": [],
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
            
            project_dict["supervisors"] = [
                {
                    "id": supervisor.id,
                    "name": supervisor.name,
                    "email": supervisor.email,
                    "year": supervisor.year,
                    "school_id": supervisor.school_id
                } for supervisor in project.supervisors
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
            joinedload(Project.supervisors),
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
            "supervisors": [],
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
        
        project_dict["supervisors"] = [
            {
                "id": supervisor.id,
                "name": supervisor.name,
                "email": supervisor.email,
                "year": supervisor.year,
                "school_id": supervisor.school_id
            } for supervisor in project.supervisors
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
            "supervisors": [],
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
    request: Request,
    db: Session = Depends(get_db),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    year: Optional[int] = Form(None),
    category_id: Optional[int] = Form(None),
    projectType: Optional[int] = Form(None),
    external_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    try:
        content_type = request.headers.get("content-type", "")
        
        if "application/json" in content_type:
            body = await request.json()
            title = body.get("title")
            description = body.get("description")
            year = body.get("year")
            category_id = body.get("category_id")
            projectType = body.get("projectType")
            external_id = body.get("external_id")
        
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
            "supervisors": [],
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

@router.get("/export/csv")
async def export_projects_csv(
    db: Session = Depends(get_db)
):
    """Exporta todos os projetos para CSV"""
    try:
        projects = db.query(Project).filter(Project.deleted_at == None).all()
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalhos
        headers = ["id", "title", "description", "year", "category_id", "projectType", "external_id", "file", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for project in projects:
            writer.writerow([
                project.id,
                project.title,
                project.description or "",
                project.year,
                project.category_id,
                project.projectType,
                project.external_id or "",
                project.file or "",
                project.created_at.isoformat() if project.created_at else "",
                project.updated_at.isoformat() if project.updated_at else "",
                project.deleted_at.isoformat() if project.deleted_at else ""
            ])
        
        temp_file.close()
        
        return FileResponse(
            path=temp_file.name,
            filename="projects_export.csv",
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar projetos: {str(e)}"
        )

@router.get("/import/molde")
async def download_project_molde():
    """Download do arquivo molde para projetos"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/project.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="project_molde.csv",
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
async def import_projects_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa projetos de um arquivo CSV"""
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
                # Verificar se a categoria existe
                category = db.query(Category).filter(Category.id == row['category_id']).first()
                if not category:
                    errors.append(f"Linha {index + 2}: Categoria com ID {row['category_id']} não encontrada")
                    continue
                
                # Verificar se o projeto já existe
                existing_project = db.query(Project).filter(
                    Project.title == row['title'],
                    Project.year == row['year']
                ).first()
                if existing_project:
                    errors.append(f"Linha {index + 2}: Projeto {row['title']} para o ano {row['year']} já existe")
                    continue
                
                # Criar novo projeto
                project = Project(
                    title=row['title'],
                    description=row.get('description'),
                    year=row['year'],
                    category_id=row['category_id'],
                    projectType=row['projectType'],
                    external_id=row.get('external_id'),
                    file=row.get('file')
                )
                
                db.add(project)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} projetos importados.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar projetos: {str(e)}"
        ) 