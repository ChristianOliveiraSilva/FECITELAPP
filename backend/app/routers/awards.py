from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.award import Award
from app.schemas.award import (
    AwardCreate, AwardUpdate, AwardListResponse, AwardDetailResponse
)
from typing import Optional
import csv
import io
import pandas as pd
from datetime import datetime
import os
import tempfile

router = APIRouter()

@router.get("/", response_model=AwardListResponse)
async def get_awards(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Award).filter(Award.deleted_at == None).options(joinedload(Award.questions))
        
        awards = query.offset(skip).limit(limit).all()
        
        award_data = []
        for award in awards:
            award_dict = {
                "id": award.id,
                "name": award.name,
                "description": award.description,
                "school_grade": award.school_grade,
                "total_positions": award.total_positions,
                "use_school_grades": award.use_school_grades,
                "use_categories": award.use_categories,
                "created_at": award.created_at,
                "updated_at": award.updated_at,
                "deleted_at": award.deleted_at,
                "questions": []
            }
            
            award_dict["questions"] = [
                {
                    "id": question.id,
                    "scientific_text": question.scientific_text,
                    "technological_text": question.technological_text,
                    "type": question.type,
                    "number_alternatives": question.number_alternatives
                } for question in award.questions
            ]
            
            award_data.append(award_dict)
        
        return AwardListResponse(
            status=True,
            message="Awards retrieved successfully",
            data=award_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving awards: {str(e)}"
        )

@router.get("/{award_id}", response_model=AwardDetailResponse)
async def get_award(
    award_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Award).filter(Award.deleted_at == None).options(joinedload(Award.questions))
        
        award = query.filter(Award.id == award_id).first()
        
        if not award:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Award not found"
            )
        
        award_dict = {
            "id": award.id,
            "name": award.name,
            "description": award.description,
            "school_grade": award.school_grade,
            "total_positions": award.total_positions,
            "use_school_grades": award.use_school_grades,
            "use_categories": award.use_categories,
            "created_at": award.created_at,
            "updated_at": award.updated_at,
            "deleted_at": award.deleted_at,
            "questions": []
        }
        
        award_dict["questions"] = [
            {
                "id": question.id,
                "scientific_text": question.scientific_text,
                "technological_text": question.technological_text,
                "type": question.type,
                "number_alternatives": question.number_alternatives
            } for question in award.questions
        ]
        
        return AwardDetailResponse(
            status=True,
            message="Award retrieved successfully",
            data=award_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving award: {str(e)}"
        )

@router.post("/", response_model=AwardDetailResponse)
async def create_award(award_data: AwardCreate, db: Session = Depends(get_db)):
    try:
        award = Award(
            name=award_data.name,
            description=award_data.description,
            school_grade=award_data.school_grade,
            total_positions=award_data.total_positions,
            use_school_grades=award_data.use_school_grades,
            use_categories=award_data.use_categories
        )
        
        db.add(award)
        db.commit()
        db.refresh(award)
        
        award_dict = {
            "id": award.id,
            "name": award.name,
            "description": award.description,
            "school_grade": award.school_grade,
            "total_positions": award.total_positions,
            "use_school_grades": award.use_school_grades,
            "use_categories": award.use_categories,
            "created_at": award.created_at,
            "updated_at": award.updated_at,
            "deleted_at": award.deleted_at,
            "questions": []
        }
            
        award_dict["questions"] = [
            {
                "id": question.id,
                "scientific_text": question.scientific_text,
                "technological_text": question.technological_text,
                "type": question.type,
                "number_alternatives": question.number_alternatives
            } for question in award.questions
        ]
        
        return AwardDetailResponse(
            status=True,
            message="Award created successfully",
            data=award_dict
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating award: {str(e)}"
        )

@router.put("/{award_id}", response_model=AwardDetailResponse)
async def update_award(
    award_id: int,
    award_data: AwardUpdate,
    db: Session = Depends(get_db)
):
    try:
        award = db.query(Award).filter(Award.id == award_id).first()
        
        if not award:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Award not found"
            )
        
        update_data = award_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(award, field, value)
        
        db.commit()
        db.refresh(award)
        
        award_dict = {
            "id": award.id,
            "name": award.name,
            "description": award.description,
            "school_grade": award.school_grade,
            "total_positions": award.total_positions,
            "use_school_grades": award.use_school_grades,
            "use_categories": award.use_categories,
            "created_at": award.created_at,
            "updated_at": award.updated_at,
            "deleted_at": award.deleted_at,
            "questions": []
        }
            
        award_dict["questions"] = [
            {
                "id": question.id,
                "scientific_text": question.scientific_text,
                "technological_text": question.technological_text,
                "type": question.type,
                "number_alternatives": question.number_alternatives
            } for question in award.questions
        ]
        
        return AwardDetailResponse(
            status=True,
            message="Award updated successfully",
            data=award_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating award: {str(e)}"
        )

@router.delete("/{award_id}")
async def delete_award(award_id: int, db: Session = Depends(get_db)):
    try:
        award = db.query(Award).filter(Award.id == award_id).first()
        
        if not award:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Award not found"
            )
        
        from datetime import datetime
        award.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Award deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting award: {str(e)}"
        )

@router.get("/export/csv")
async def export_awards_csv(
    db: Session = Depends(get_db)
):
    """Exporta todos os prêmios para CSV"""
    try:
        awards = db.query(Award).filter(Award.deleted_at == None).all()
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalhos
        headers = ["id", "name", "description", "school_grade", "total_positions", "use_school_grades", "use_categories", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for award in awards:
            writer.writerow([
                award.id,
                award.name,
                award.description or "",
                award.school_grade or "",
                award.total_positions or "",
                award.use_school_grades or "",
                award.use_categories or "",
                award.created_at.isoformat() if award.created_at else "",
                award.updated_at.isoformat() if award.updated_at else "",
                award.deleted_at.isoformat() if award.deleted_at else ""
            ])
        
        temp_file.close()
        
        return FileResponse(
            path=temp_file.name,
            filename="awards_export.csv",
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar prêmios: {str(e)}"
        )

@router.get("/import/molde")
async def download_award_molde():
    """Download do arquivo molde para prêmios"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/award.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="award_molde.csv",
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
async def import_awards_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa prêmios de um arquivo CSV"""
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
                # Verificar se o prêmio já existe
                existing_award = db.query(Award).filter(Award.name == row['name']).first()
                if existing_award:
                    errors.append(f"Linha {index + 2}: Prêmio {row['name']} já existe")
                    continue
                
                # Criar novo prêmio
                award = Award(
                    name=row['name'],
                    description=row.get('description'),
                    school_grade=row.get('school_grade'),
                    total_positions=row.get('total_positions'),
                    use_school_grades=row.get('use_school_grades'),
                    use_categories=row.get('use_categories')
                )
                
                db.add(award)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} prêmios importados.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar prêmios: {str(e)}"
        ) 