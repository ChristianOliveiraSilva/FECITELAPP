from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.assessment import Assessment
from app.models.evaluator import Evaluator
from app.models.project import Project
from app.schemas.assessment import (
    AssessmentCreate, AssessmentUpdate, AssessmentListResponse, AssessmentDetailResponse
)
from typing import Optional
import csv
import io
import pandas as pd
from datetime import datetime
import os

router = APIRouter()

@router.get("/", response_model=AssessmentListResponse)
async def get_assessments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Assessment).filter(Assessment.deleted_at == None).options(
            joinedload(Assessment.evaluator),
            joinedload(Assessment.project),
            joinedload(Assessment.responses)
        )
        
        assessments = query.offset(skip).limit(limit).all()
        
        assessment_data = []
        for assessment in assessments:
            assessment_dict = {
                "id": assessment.id,
                "evaluator_id": assessment.evaluator_id,
                "project_id": assessment.project_id,
                "created_at": assessment.created_at,
                "updated_at": assessment.updated_at,
                "deleted_at": assessment.deleted_at,
                "evaluator": None,
                "project": None,
                "responses": []
            }
            
            if assessment.evaluator:
                assessment_dict["evaluator"] = {
                    "id": assessment.evaluator.id,
                    "PIN": assessment.evaluator.PIN,
                    "user_id": assessment.evaluator.user_id
                }
            
            if assessment.project:
                assessment_dict["project"] = {
                    "id": assessment.project.id,
                    "title": assessment.project.title,
                    "year": assessment.project.year,
                    "category_id": assessment.project.category_id
                }
            
            assessment_dict["responses"] = [
                {
                    "id": response.id,
                    "question_id": response.question_id,
                    "response": response.response,
                    "score": response.score
                } for response in assessment.responses
            ]
            
            assessment_data.append(assessment_dict)
        
        return AssessmentListResponse(
            status=True,
            message="Avaliações recuperadas com sucesso",
            data=assessment_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar avaliações: {str(e)}"
        )

@router.get("/{assessment_id}", response_model=AssessmentDetailResponse)
async def get_assessment(
    assessment_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Assessment).filter(Assessment.deleted_at == None).options(
            joinedload(Assessment.evaluator),
            joinedload(Assessment.project),
            joinedload(Assessment.responses)
        )
        
        assessment = query.filter(Assessment.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        assessment_dict = {
            "id": assessment.id,
            "evaluator_id": assessment.evaluator_id,
            "project_id": assessment.project_id,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
            "deleted_at": assessment.deleted_at,
            "evaluator": None,
            "project": None,
            "responses": []
        }
        
        if assessment.evaluator:
            assessment_dict["evaluator"] = {
                "id": assessment.evaluator.id,
                "PIN": assessment.evaluator.PIN,
                "user_id": assessment.evaluator.user_id
            }
        
        if assessment.project:
            assessment_dict["project"] = {
                "id": assessment.project.id,
                "title": assessment.project.title,
                "year": assessment.project.year,
                "category_id": assessment.project.category_id
            }
        
        assessment_dict["responses"] = [
            {
                "id": response.id,
                "question_id": response.question_id,
                "response": response.response,
                "score": response.score
            } for response in assessment.responses
        ]
        
        return AssessmentDetailResponse(
            status=True,
            message="Avaliação recuperada com sucesso",
            data=assessment_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar avaliação: {str(e)}"
        )

@router.post("/", response_model=AssessmentDetailResponse)
async def create_assessment(assessment_data: AssessmentCreate, db: Session = Depends(get_db)):
    try:
        evaluator = db.query(Evaluator).filter(Evaluator.id == assessment_data.evaluator_id).first()
        if not evaluator:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Avaliador não encontrado"
            )
        
        project = db.query(Project).filter(Project.id == assessment_data.project_id).first()
        if not project:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Projeto não encontrado"
            )
        
        existing_assessment = db.query(Assessment).filter(
            Assessment.evaluator_id == assessment_data.evaluator_id,
            Assessment.project_id == assessment_data.project_id,
            Assessment.deleted_at == None,
        ).first()
        
        if existing_assessment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Já existe uma avaliação para este avaliador e projeto"
            )
        
        assessment = Assessment(
            evaluator_id=assessment_data.evaluator_id,
            project_id=assessment_data.project_id
        )
        
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        
        assessment_dict = {
            "id": assessment.id,
            "evaluator_id": assessment.evaluator_id,
            "project_id": assessment.project_id,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
            "deleted_at": assessment.deleted_at,
            "evaluator": None,
            "project": None,
            "responses": []
        }
        
        if assessment.evaluator:
            assessment_dict["evaluator"] = {
                "id": assessment.evaluator.id,
                "PIN": assessment.evaluator.PIN,
                "user_id": assessment.evaluator.user_id
            }
        
        if assessment.project:
            assessment_dict["project"] = {
                "id": assessment.project.id,
                "title": assessment.project.title,
                "year": assessment.project.year,
                "category_id": assessment.project.category_id
            }
        
        assessment_dict["responses"] = [
            {
                "id": response.id,
                "question_id": response.question_id,
                "response": response.response,
                "score": response.score
            } for response in assessment.responses
        ]
        
        return AssessmentDetailResponse(
            status=True,
            message="Avaliação criada com sucesso",
            data=assessment_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar avaliação: {str(e)}"
        )

@router.put("/{assessment_id}", response_model=AssessmentDetailResponse)
async def update_assessment(
    assessment_id: int,
    assessment_data: AssessmentUpdate,
    db: Session = Depends(get_db)
):
    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        if assessment_data.evaluator_id != assessment.evaluator_id:
            evaluator = db.query(Evaluator).filter(Evaluator.id == assessment_data.evaluator_id).first()
            if not evaluator:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Avaliador não encontrado"
                )

        if assessment_data.project_id != assessment.project_id:
            project = db.query(Project).filter(Project.id == assessment_data.project_id).first()
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Projeto não encontrado"
                )
        
        if assessment_data.project_id:
            existing_assessment = db.query(Assessment).filter(
                Assessment.evaluator_id == assessment_data.evaluator_id,
                Assessment.project_id == assessment_data.project_id,
                Assessment.id != assessment_id,
                Assessment.deleted_at == None,
            ).first()
            
            if existing_assessment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Já existe uma avaliação para este avaliador e projeto"
                )
        
        update_data = assessment_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(assessment, field, value)
        
        db.commit()
        db.refresh(assessment)
        
        assessment_dict = {
            "id": assessment.id,
            "evaluator_id": assessment.evaluator_id,
            "project_id": assessment.project_id,
            "created_at": assessment.created_at,
            "updated_at": assessment.updated_at,
            "deleted_at": assessment.deleted_at,
            "evaluator": None,
            "project": None,
            "responses": []
        }
        
        if assessment.evaluator:
            assessment_dict["evaluator"] = {
                "id": assessment.evaluator.id,
                "PIN": assessment.evaluator.PIN,
                "user_id": assessment.evaluator.user_id
            }
        
        if assessment.project:
            assessment_dict["project"] = {
                "id": assessment.project.id,
                "title": assessment.project.title,
                "year": assessment.project.year,
                "category_id": assessment.project.category_id
            }
        
        assessment_dict["responses"] = [
            {
                "id": response.id,
                "question_id": response.question_id,
                "response": response.response,
                "score": response.score
            } for response in assessment.responses
        ]
        
        return AssessmentDetailResponse(
            status=True,
            message="Avaliação atualizada com sucesso",
            data=assessment_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar avaliação: {str(e)}"
        )

@router.delete("/{assessment_id}")
async def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    try:
        assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
        
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        from datetime import datetime
        assessment.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Avaliação excluída com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir avaliação: {str(e)}"
        )

@router.get("/export/csv")
async def export_assessments_csv(
    db: Session = Depends(get_db)
):
    """Exporta todas as avaliações para CSV"""
    try:
        assessments = db.query(Assessment).filter(Assessment.deleted_at == None).all()
        
        # Criar buffer de memória para o CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Cabeçalhos
        headers = ["id", "evaluator_id", "project_id", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for assessment in assessments:
            writer.writerow([
                assessment.id,
                assessment.evaluator_id,
                assessment.project_id,
                assessment.created_at.isoformat() if assessment.created_at else "",
                assessment.updated_at.isoformat() if assessment.updated_at else "",
                assessment.deleted_at.isoformat() if assessment.deleted_at else ""
            ])
        
        output.seek(0)
        csv_content = output.getvalue()
        output.close()
        
        return {
            "status": True,
            "message": "Avaliações exportadas com sucesso",
            "data": csv_content
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar avaliações: {str(e)}"
        )

@router.get("/import/molde")
async def download_assessment_molde():
    """Download do arquivo molde para avaliações"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/assessment.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="assessment_molde.csv",
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
async def import_assessments_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa avaliações de um arquivo CSV"""
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
                # Verificar se o avaliador existe
                evaluator = db.query(Evaluator).filter(Evaluator.id == row['evaluator_id']).first()
                if not evaluator:
                    errors.append(f"Linha {index + 2}: Avaliador com ID {row['evaluator_id']} não encontrado")
                    continue
                
                # Verificar se o projeto existe
                project = db.query(Project).filter(Project.id == row['project_id']).first()
                if not project:
                    errors.append(f"Linha {index + 2}: Projeto com ID {row['project_id']} não encontrado")
                    continue
                
                # Verificar se já existe avaliação para este avaliador e projeto
                existing_assessment = db.query(Assessment).filter(
                    Assessment.evaluator_id == row['evaluator_id'],
                    Assessment.project_id == row['project_id'],
                    Assessment.deleted_at == None
                ).first()
                if existing_assessment:
                    errors.append(f"Linha {index + 2}: Já existe uma avaliação para este avaliador e projeto")
                    continue
                
                # Criar nova avaliação
                assessment = Assessment(
                    evaluator_id=row['evaluator_id'],
                    project_id=row['project_id']
                )
                
                db.add(assessment)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} avaliações importadas.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar avaliações: {str(e)}"
        ) 