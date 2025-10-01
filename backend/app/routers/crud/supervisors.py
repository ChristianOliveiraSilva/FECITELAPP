from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.supervisor import Supervisor
from app.models.school import School
from app.schemas.supervisor import (
    SupervisorCreate, SupervisorUpdate, SupervisorListResponse, SupervisorDetailResponse
)
from typing import Optional
from datetime import datetime
import csv
import io
import pandas as pd
import os
import tempfile
from sqlalchemy import and_

router = APIRouter()

@router.get("/", response_model=SupervisorListResponse)
async def get_supervisors(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    year: Optional[int] = Query(None, description="Filter by year (defaults to current year)"),
    name: Optional[str] = Query(None, description="Filter by supervisor name"),
    email: Optional[str] = Query(None, description="Filter by supervisor email"),
    school_name: Optional[str] = Query(None, description="Filter by school name"),
    db: Session = Depends(get_db)
):
    try:
        filter_year = year if year is not None else datetime.now().year
        
        # Construir filtros dinâmicos
        filters = [
            Supervisor.deleted_at == None,
            Supervisor.year == filter_year
        ]
        
        if name:
            filters.append(Supervisor.name.ilike(f"%{name}%"))
        
        if email:
            filters.append(Supervisor.email.ilike(f"%{email}%"))
        
        query = db.query(Supervisor)
        
        if school_name:
            query = query.join(School, Supervisor.school_id == School.id)
            filters.append(School.name.ilike(f"%{school_name}%"))
        
        query = query.filter(and_(*filters)).options(
            joinedload(Supervisor.school),
            joinedload(Supervisor.projects)
        )
        
        supervisors = query.offset(skip).limit(limit).all()
        
        supervisor_data = []
        for supervisor in supervisors:
            supervisor_dict = {
                "id": supervisor.id,
                "name": supervisor.name,
                "email": supervisor.email,
                "year": supervisor.year,
                "school_id": supervisor.school_id,
                "created_at": supervisor.created_at,
                "updated_at": supervisor.updated_at,
                "deleted_at": supervisor.deleted_at,
                "school": None,
                "projects": []
            }
            
            if supervisor.school:
                supervisor_dict["school"] = {
                    "id": supervisor.school.id,
                    "name": supervisor.school.name
                }
            
            supervisor_dict["projects"] = [
                {
                    "id": project.id,
                    "title": project.title,
                    "year": project.year,
                    "category_id": project.category_id
                } for project in supervisor.projects
            ]
            
            supervisor_data.append(supervisor_dict)
        
        return SupervisorListResponse(
            status=True,
            message=f"Supervisors retrieved successfully for year {filter_year}",
            data=supervisor_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar orientadores: {str(e)}"
        )

@router.get("/{supervisor_id}", response_model=SupervisorDetailResponse)
async def get_supervisor(
    supervisor_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Supervisor).filter(Supervisor.deleted_at == None).options(
            joinedload(Supervisor.school),
            joinedload(Supervisor.projects)
        )
        
        supervisor = query.filter(Supervisor.id == supervisor_id).first()
        
        if not supervisor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orientador não encontrado"
            )
        
        supervisor_dict = {
            "id": supervisor.id,
            "name": supervisor.name,
            "email": supervisor.email,
            "year": supervisor.year,
            "school_id": supervisor.school_id,
            "created_at": supervisor.created_at,
            "updated_at": supervisor.updated_at,
            "deleted_at": supervisor.deleted_at,
            "school": None,
            "projects": []
        }
        
        if supervisor.school:
            supervisor_dict["school"] = {
                "id": supervisor.school.id,
                "name": supervisor.school.name
            }
        
        supervisor_dict["projects"] = [
            {
                "id": project.id,
                "title": project.title,
                "year": project.year,
                "category_id": project.category_id
            } for project in supervisor.projects
        ]
        
        return SupervisorDetailResponse(
            status=True,
            message="Orientador recuperado com sucesso",
            data=supervisor_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar orientador: {str(e)}"
        )

@router.post("/", response_model=SupervisorDetailResponse)
async def create_supervisor(supervisor_data: SupervisorCreate, db: Session = Depends(get_db)):
    try:
        school = db.query(School).filter(School.id == supervisor_data.school_id).first()
        if not school:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Escola não encontrada"
            )
        
        supervisor = Supervisor(
            name=supervisor_data.name,
            email=supervisor_data.email,
            year=getattr(supervisor_data, 'year', datetime.now().year),
            school_id=supervisor_data.school_id
        )
        
        db.add(supervisor)
        db.commit()
        db.refresh(supervisor)
        
        supervisor_dict = {
            "id": supervisor.id,
            "name": supervisor.name,
            "email": supervisor.email,
            "school_id": supervisor.school_id,
            "year": supervisor.year,
            "created_at": supervisor.created_at,
            "updated_at": supervisor.updated_at,
            "deleted_at": supervisor.deleted_at,
            "school": None,
            "projects": []
        }
        
        if supervisor.school:
            supervisor_dict["school"] = {
                "id": supervisor.school.id,
                "name": supervisor.school.name
            }
        
        if supervisor.projects:
            supervisor_dict["projects"] = [
                {
                    "id": project.id,
                    "title": project.title,
                    "year": project.year,
                    "category_id": project.category_id
                } for project in supervisor.projects
            ]
        
        return SupervisorDetailResponse(
            status=True,
            message="Orientador criado com sucesso",
            data=supervisor_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar orientador: {str(e)}"
        )

@router.put("/{supervisor_id}", response_model=SupervisorDetailResponse)
async def update_supervisor(
    supervisor_id: int,
    supervisor_data: SupervisorUpdate,
    db: Session = Depends(get_db)
):
    try:
        supervisor = db.query(Supervisor).filter(Supervisor.id == supervisor_id).first()
        
        if not supervisor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orientador não encontrado"
            )
        
        if supervisor_data.name is not None:
            supervisor.name = supervisor_data.name
        
        if supervisor_data.email is not None:
            supervisor.email = supervisor_data.email
        
        if supervisor_data.year is not None:
            supervisor.year = supervisor_data.year
        
        if supervisor_data.school_id is not None:
            school = db.query(School).filter(School.id == supervisor_data.school_id).first()
            if not school:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Escola não encontrada"
                )
            supervisor.school_id = supervisor_data.school_id
        
        db.commit()
        db.refresh(supervisor)
        
        supervisor_dict = {
            "id": supervisor.id,
            "name": supervisor.name,
            "email": supervisor.email,
            "school_id": supervisor.school_id,
            "year": supervisor.year,
            "created_at": supervisor.created_at,
            "updated_at": supervisor.updated_at,
            "deleted_at": supervisor.deleted_at,
            "school": None,
            "projects": []
        }
        
        if supervisor.school:
            supervisor_dict["school"] = {
                "id": supervisor.school.id,
                "name": supervisor.school.name
            }
        
        if supervisor.projects:
            supervisor_dict["projects"] = [
                {
                    "id": project.id,
                    "title": project.title,
                    "year": project.year,
                    "category_id": project.category_id
                } for project in supervisor.projects
            ]
        
        return SupervisorDetailResponse(
            status=True,
            message="Orientador atualizado com sucesso",
            data=supervisor_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar orientador: {str(e)}"
        )

@router.delete("/{supervisor_id}")
async def delete_supervisor(supervisor_id: int, db: Session = Depends(get_db)):
    try:
        supervisor = db.query(Supervisor).filter(Supervisor.id == supervisor_id).first()
        
        if not supervisor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orientador não encontrado"
            )
        
        supervisor.deleted_at = datetime.utcnow()
        db.commit()
        
        return {
            "status": True,
            "message": "Orientador excluído com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir orientador: {str(e)}"
        )

@router.get("/export/csv")
async def export_supervisors_csv(
    db: Session = Depends(get_db)
):
    """Exporta todos os orientadores para CSV"""
    try:
        supervisors = db.query(Supervisor).filter(Supervisor.deleted_at == None).all()
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalhos
        headers = ["id", "name", "email", "year", "school_id", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for supervisor in supervisors:
            writer.writerow([
                supervisor.id,
                supervisor.name,
                supervisor.email or "",
                supervisor.year,
                supervisor.school_id,
                supervisor.created_at.isoformat() if supervisor.created_at else "",
                supervisor.updated_at.isoformat() if supervisor.updated_at else "",
                supervisor.deleted_at.isoformat() if supervisor.deleted_at else ""
            ])
        
        temp_file.close()
        
        return FileResponse(
            path=temp_file.name,
            filename="supervisors_export.csv",
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar orientadores: {str(e)}"
        )

@router.get("/import/molde")
async def download_supervisor_molde():
    """Download do arquivo molde para orientadores"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/supervisor.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="supervisor_molde.csv",
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
async def import_supervisors_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa orientadores de um arquivo CSV"""
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
                
                # Criar novo orientador
                supervisor = Supervisor(
                    name=row['name'],
                    email=row.get('email'),
                    year=row.get('year', datetime.now().year),
                    school_id=row['school_id']
                )
                
                db.add(supervisor)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} orientadores importados.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar orientadores: {str(e)}"
        )
