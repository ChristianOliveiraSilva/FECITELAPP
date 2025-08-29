from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
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
import csv
import io
import pandas as pd
import os
import tempfile
from sqlalchemy import and_

router = APIRouter()

@router.get("/", response_model=EvaluatorListResponse)
async def get_evaluators(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    year: Optional[int] = Query(None, description="Filter by year (defaults to current year)"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    PIN: Optional[str] = Query(None, description="Filter by PIN"),
    db: Session = Depends(get_db)
):
    try:
        filter_year = year if year is not None else datetime.now().year
        
        # Construir filtros dinâmicos
        filters = [
            Evaluator.deleted_at == None,
            Evaluator.year == filter_year
        ]
        
        if user_id:
            filters.append(Evaluator.user_id == user_id)
        
        if PIN:
            filters.append(Evaluator.PIN.ilike(f"%{PIN}%"))
        
        query = db.query(Evaluator).filter(and_(*filters)).options(
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
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Evaluator).filter(Evaluator.deleted_at == None).options(
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
                detail="Usuário não encontrado"
            )

        existing_evaluator = db.query(Evaluator).filter(Evaluator.user_id == evaluator_data.user_id).first()
        if existing_evaluator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário já possui um perfil de avaliador"
            )

        pin = evaluator_data.PIN
        if pin:
            existing_pin = db.query(Evaluator).filter(Evaluator.PIN == pin).first()
            if existing_pin:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PIN já está em uso, por favor escolha outro"
                )
        else:
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
            "year": evaluator.year,
            "created_at": evaluator.created_at,
            "updated_at": evaluator.updated_at,
            "deleted_at": evaluator.deleted_at,
            "user": None,
            "assessments": [],
            "categories": []
        }
        
        
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
    try:
        evaluator = db.query(Evaluator).filter(Evaluator.id == evaluator_id).first()
        
        if not evaluator:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliador não encontrado"
            )
        
        if evaluator_data.user_id and evaluator_data.user_id != evaluator.user_id:
            user = db.query(User).filter(User.id == evaluator_data.user_id).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Usuário não encontrado"
                )
            
            existing_evaluator = db.query(Evaluator).filter(
                Evaluator.user_id == evaluator_data.user_id,
                Evaluator.id != evaluator_id
            ).first()
            if existing_evaluator:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Usuário já possui um perfil de avaliador"
                )
        
        if evaluator_data.PIN and evaluator_data.PIN != evaluator.PIN:
            existing_pin = db.query(Evaluator).filter(
                Evaluator.PIN == evaluator_data.PIN,
                Evaluator.id != evaluator_id
            ).first()
            if existing_pin:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PIN já existe"
                )
        
        update_data = evaluator_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(evaluator, field, value)
        
        db.commit()
        db.refresh(evaluator)
        
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

@router.get("/export/csv")
async def export_evaluators_csv(
    db: Session = Depends(get_db)
):
    """Exporta todos os avaliadores para CSV"""
    try:
        evaluators = db.query(Evaluator).filter(Evaluator.deleted_at == None).all()
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalhos
        headers = ["id", "user_id", "PIN", "year", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for evaluator in evaluators:
            writer.writerow([
                evaluator.id,
                evaluator.user_id,
                evaluator.PIN,
                evaluator.year,
                evaluator.created_at.isoformat() if evaluator.created_at else "",
                evaluator.updated_at.isoformat() if evaluator.updated_at else "",
                evaluator.deleted_at.isoformat() if evaluator.deleted_at else ""
            ])
        
        temp_file.close()
        
        return FileResponse(
            path=temp_file.name,
            filename="evaluators_export.csv",
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar avaliadores: {str(e)}"
        )

@router.get("/import/molde")
async def download_evaluator_molde():
    """Download do arquivo molde para avaliadores"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/evaluator.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="evaluator_molde.csv",
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
async def import_evaluators_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa avaliadores de um arquivo CSV"""
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
                # Verificar se o usuário existe
                user = db.query(User).filter(User.id == row['user_id']).first()
                if not user:
                    errors.append(f"Linha {index + 2}: Usuário com ID {row['user_id']} não encontrado")
                    continue
                
                # Verificar se já existe avaliador para este usuário
                existing_evaluator = db.query(Evaluator).filter(Evaluator.user_id == row['user_id']).first()
                if existing_evaluator:
                    errors.append(f"Linha {index + 2}: Usuário {user.name} já possui um perfil de avaliador")
                    continue
                
                # Verificar se o PIN já existe
                if 'PIN' in row and pd.notna(row['PIN']):
                    existing_pin = db.query(Evaluator).filter(Evaluator.PIN == row['PIN']).first()
                    if existing_pin:
                        errors.append(f"Linha {index + 2}: PIN {row['PIN']} já está em uso")
                        continue
                    pin = str(row['PIN'])
                else:
                    # Gerar PIN automático
                    while True:
                        pin = str(random.randint(1111, 9999))
                        existing_pin = db.query(Evaluator).filter(Evaluator.PIN == pin).first()
                        if not existing_pin:
                            break
                
                # Criar novo avaliador
                evaluator = Evaluator(
                    user_id=row['user_id'],
                    PIN=pin,
                    year=row.get('year', datetime.now().year)
                )
                
                db.add(evaluator)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} avaliadores importados.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar avaliadores: {str(e)}"
        ) 