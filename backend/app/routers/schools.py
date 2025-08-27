from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.school import School
from app.schemas.school import (
    SchoolCreate, SchoolUpdate, SchoolListResponse, SchoolDetailResponse
)
from typing import Optional
import csv
import io
from datetime import datetime
import pandas as pd
import os
import tempfile

router = APIRouter()

@router.get("/", response_model=SchoolListResponse)
async def get_schools(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(School).filter(School.deleted_at == None).options(joinedload(School.students))
        
        schools = query.offset(skip).limit(limit).all()
        
        school_data = []
        for school in schools:
            school_dict = {
                "id": school.id,
                "name": school.name,
                "city": school.city,
                "state": school.state,
                "created_at": school.created_at,
                "updated_at": school.updated_at,
                "deleted_at": school.deleted_at,
                "students": []
            }
            
            school_dict["students"] = [
                {
                    "id": student.id,
                    "name": student.name,
                    "school_grade": student.school_grade,
                    "created_at": student.created_at
                } for student in school.students
            ]
            
            school_data.append(school_dict)
        
        return SchoolListResponse(
            status=True,
            message="Schools retrieved successfully",
            data=school_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving schools: {str(e)}"
        )

@router.get("/{school_id}", response_model=SchoolDetailResponse)
async def get_school(
    school_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(School).filter(School.deleted_at == None).options(joinedload(School.students))

        school = query.filter(School.id == school_id).first()

        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        school_dict = {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "created_at": school.created_at,
            "updated_at": school.updated_at,
            "deleted_at": school.deleted_at,
            "students": []
        }
        
        school_dict["students"] = [
            {
                "id": student.id,
                "name": student.name,
                "school_grade": student.school_grade,
                "created_at": student.created_at
            } for student in school.students
        ]
    
        return SchoolDetailResponse(
            status=True,
            message="School retrieved successfully",
            data=school_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving school: {str(e)}"
        )

@router.post("/", response_model=SchoolDetailResponse)
async def create_school(school_data: SchoolCreate, db: Session = Depends(get_db)):
    try:
        school = School(name=school_data.name, city=school_data.city, state=school_data.state)
        
        db.add(school)
        db.commit()
        db.refresh(school)
        
        school_dict = {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "created_at": school.created_at,
            "updated_at": school.updated_at,
            "deleted_at": school.deleted_at,
            "students": []
        }
        
        school_dict["students"] = [
            {
                "id": student.id,
                "name": student.name,
                "school_grade": student.school_grade,
                "created_at": student.created_at
            } for student in school.students
        ]

        return SchoolDetailResponse(
            status=True,
            message="School created successfully",
            data=school_dict
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating school: {str(e)}"
        )

@router.put("/{school_id}", response_model=SchoolDetailResponse)
async def update_school(
    school_id: int,
    school_data: SchoolUpdate,
    db: Session = Depends(get_db)
):
    try:
        school = db.query(School).filter(School.id == school_id).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        update_data = school_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(school, field, value)
        
        db.commit()
        db.refresh(school)
        
        school_dict = {
            "id": school.id,
            "name": school.name,
            "city": school.city,
            "state": school.state,
            "created_at": school.created_at,
            "updated_at": school.updated_at,
            "deleted_at": school.deleted_at,
            "students": []
        }
        
        school_dict["students"] = [
            {
                "id": student.id,
                "name": student.name,
                "school_grade": student.school_grade,
                "created_at": student.created_at
            } for student in school.students
        ]
        
        return SchoolDetailResponse(
            status=True,
            message="School updated successfully",
            data=school_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating school: {str(e)}"
        )

@router.delete("/{school_id}")
async def delete_school(school_id: int, db: Session = Depends(get_db)):
    try:
        school = db.query(School).filter(School.id == school_id).first()
        
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="School not found"
            )
        
        from datetime import datetime
        school.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "School deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting school: {str(e)}"
        ) 

@router.get("/export/csv")
async def export_schools_csv(
    db: Session = Depends(get_db)
):
    """Exporta todas as escolas para CSV"""
    try:
        schools = db.query(School).filter(School.deleted_at == None).all()
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalhos
        headers = ["id", "name", "city", "state", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for school in schools:
            writer.writerow([
                school.id,
                school.name,
                school.city or "",
                school.state or "",
                school.created_at.isoformat() if school.created_at else "",
                school.updated_at.isoformat() if school.updated_at else "",
                school.deleted_at.isoformat() if school.deleted_at else ""
            ])
        
        temp_file.close()
        
        return FileResponse(
            path=temp_file.name,
            filename="schools_export.csv",
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar escolas: {str(e)}"
        )

@router.get("/import/molde")
async def download_school_molde():
    """Download do arquivo molde para escolas"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/school.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="school_molde.csv",
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
async def import_schools_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa escolas de um arquivo CSV"""
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
                # Verificar se a escola já existe
                existing_school = db.query(School).filter(School.name == row['name']).first()
                if existing_school:
                    errors.append(f"Linha {index + 2}: Escola {row['name']} já existe")
                    continue
                
                # Criar nova escola
                school = School(
                    name=row['name'],
                    city=row.get('city'),
                    state=row.get('state')
                )
                
                db.add(school)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} escolas importadas.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar escolas: {str(e)}"
        ) 