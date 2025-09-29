from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.question import Question
from app.schemas.question import (
    QuestionCreate, QuestionUpdate, QuestionListResponse, QuestionDetailResponse
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

@router.get("/", response_model=QuestionListResponse)
async def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    year: Optional[int] = Query(None, description="Filter by year (defaults to current year)"),
    scientific_text: Optional[str] = Query(None, description="Filter by scientific text"),
    technological_text: Optional[str] = Query(None, description="Filter by technological text"),
    type: Optional[int] = Query(None, description="Filter by question type"),
    number_alternatives: Optional[int] = Query(None, description="Filter by number of alternatives"),
    db: Session = Depends(get_db)
):
    try:
        filter_year = year if year is not None else datetime.now().year
        
        # Construir filtros dinâmicos
        filters = [
            Question.deleted_at == None,
            Question.year == filter_year
        ]
        
        if scientific_text:
            filters.append(Question.scientific_text.ilike(f"%{scientific_text}%"))
        
        if technological_text:
            filters.append(Question.technological_text.ilike(f"%{technological_text}%"))
        
        if type is not None:
            filters.append(Question.type == type)
        
        if number_alternatives is not None:
            filters.append(Question.number_alternatives == number_alternatives)
        
        query = db.query(Question).filter(and_(*filters)).options(
            joinedload(Question.responses),
            joinedload(Question.awards)
        )
        
        questions = query.offset(skip).limit(limit).all()
        
        question_data = []
        for question in questions:
            question_dict = {
                "id": question.id,
                "scientific_text": question.scientific_text,
                "technological_text": question.technological_text,
                "type": question.type,
                "number_alternatives": question.number_alternatives,
                "year": question.year,
                "created_at": question.created_at,
                "updated_at": question.updated_at,
                "deleted_at": question.deleted_at,
                "responses": [],
                "awards": []
            }
            
            question_dict["responses"] = [
                {
                    "id": response.id,
                    "assessment_id": response.assessment_id,
                    "response": response.response,
                    "score": response.score
                } for response in question.responses
            ]
            
            question_dict["awards"] = [
                {
                    "id": award.id,
                    "name": award.name,
                    "description": award.description
                } for award in question.awards
            ]
            
            question_data.append(question_dict)
        
        return QuestionListResponse(
            status=True,
            message=f"Questions retrieved successfully for year {filter_year}",
            data=question_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving questions: {str(e)}"
        )

@router.get("/{question_id}", response_model=QuestionDetailResponse)
async def get_question(
    question_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Question).filter(Question.deleted_at == None).options(
            joinedload(Question.responses),
            joinedload(Question.awards)
        )
        
        question = query.filter(Question.id == question_id).first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        question_dict = {
            "id": question.id,
            "scientific_text": question.scientific_text,
            "technological_text": question.technological_text,
            "type": question.type,
            "number_alternatives": question.number_alternatives,
            "year": question.year,
            "created_at": question.created_at,
            "updated_at": question.updated_at,
            "deleted_at": question.deleted_at,
            "responses": [],
            "awards": []
        }
        
        question_dict["responses"] = [
            {
                "id": response.id,
                "assessment_id": response.assessment_id,
                "response": response.response,
                "score": response.score
            } for response in question.responses
        ]
        
        question_dict["awards"] = [
            {
                "id": award.id,
                "name": award.name,
                "description": award.description
            } for award in question.awards
        ]
        
        return QuestionDetailResponse(
            status=True,
            message="Question retrieved successfully",
            data=question_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving question: {str(e)}"
        )

@router.post("/", response_model=QuestionDetailResponse)
async def create_question(question_data: QuestionCreate, db: Session = Depends(get_db)):
    try:
        question = Question(
            scientific_text=question_data.scientific_text,
            technological_text=question_data.technological_text,
            type=question_data.type,
            number_alternatives=question_data.number_alternatives,
            year=getattr(question_data, 'year', datetime.now().year)
        )
        
        db.add(question)
        db.commit()
        db.refresh(question)
        
        question_dict = {
            "id": question.id,
            "scientific_text": question.scientific_text,
            "technological_text": question.technological_text,
            "type": question.type,
            "number_alternatives": question.number_alternatives,
            "year": question.year,
            "created_at": question.created_at,
            "updated_at": question.updated_at,
            "deleted_at": question.deleted_at,
            "responses": [],
            "awards": []
        }
            
        question_dict["responses"] = [
            {
                "id": response.id,
                "assessment_id": response.assessment_id,
                "response": response.response,
                "score": response.score
            } for response in question.responses
        ]
        
        question_dict["awards"] = [
            {
                "id": award.id,
                "name": award.name,
                "description": award.description
            } for award in question.awards
        ]
        
        return QuestionDetailResponse(
            status=True,
            message="Question created successfully",
            data=question_dict
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating question: {str(e)}"
        )

@router.put("/{question_id}", response_model=QuestionDetailResponse)
async def update_question(
    question_id: int,
    question_data: QuestionUpdate,
    db: Session = Depends(get_db)
):
    try:
        question = db.query(Question).filter(Question.id == question_id).first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        update_data = question_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(question, field, value)
        
        db.commit()
        db.refresh(question)
        
        question_dict = {
            "id": question.id,
            "scientific_text": question.scientific_text,
            "technological_text": question.technological_text,
            "type": question.type,
            "number_alternatives": question.number_alternatives,
            "year": question.year,
            "created_at": question.created_at,
            "updated_at": question.updated_at,
            "deleted_at": question.deleted_at,
            "responses": [],
            "awards": []
        }
            
        question_dict["responses"] = [
            {
                "id": response.id,
                "assessment_id": response.assessment_id,
                "response": response.response,
                "score": response.score
            } for response in question.responses
        ]
        
        question_dict["awards"] = [
            {
                "id": award.id,
                "name": award.name,
                "description": award.description
            } for award in question.awards
        ]
        
        return QuestionDetailResponse(
            status=True,
            message="Question updated successfully",
            data=question_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating question: {str(e)}"
        )

@router.delete("/{question_id}")
async def delete_question(question_id: int, db: Session = Depends(get_db)):
    try:
        question = db.query(Question).filter(Question.id == question_id).first()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found"
            )
        
        question.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Question deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting question: {str(e)}"
        )

@router.get("/export/csv")
async def export_questions_csv(
    db: Session = Depends(get_db)
):
    """Exporta todas as questões para CSV"""
    try:
        questions = db.query(Question).filter(Question.deleted_at == None).all()
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalhos
        headers = ["id", "scientific_text", "technological_text", "type", "number_alternatives", "year", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for question in questions:
            writer.writerow([
                question.id,
                question.scientific_text or "",
                question.technological_text or "",
                question.type,
                question.number_alternatives or "",
                question.year,
                question.created_at.isoformat() if question.created_at else "",
                question.updated_at.isoformat() if question.updated_at else "",
                question.deleted_at.isoformat() if question.deleted_at else ""
            ])
        
        temp_file.close()
        
        return FileResponse(
            path=temp_file.name,
            filename="questions_export.csv",
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar questões: {str(e)}"
        )

@router.get("/import/molde")
async def download_question_molde():
    """Download do arquivo molde para questões"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/question.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="question_molde.csv",
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
async def import_questions_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa questões de um arquivo CSV"""
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
                # Criar nova questão
                question = Question(
                    scientific_text=row.get('scientific_text'),
                    technological_text=row.get('technological_text'),
                    type=row['type'],
                    number_alternatives=row.get('number_alternatives'),
                    year=row.get('year', datetime.now().year)
                )
                
                db.add(question)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} questões importadas.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar questões: {str(e)}"
        ) 