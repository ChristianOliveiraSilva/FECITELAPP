from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserUpdate, UserListResponse, UserDetailResponse, UserWithRelations
)
from typing import Optional
import csv
import io
from datetime import datetime
import pandas as pd
import os
import tempfile

router = APIRouter()

@router.get("/", response_model=UserListResponse)
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    name: Optional[str] = Query(None, description="Filter by name"),
    email: Optional[str] = Query(None, description="Filter by email"),
    active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db)
):
    try:
        # Construir filtros dinâmicos
        filters = [User.deleted_at == None]
        
        if name:
            filters.append(User.name.ilike(f"%{name}%"))
        
        if email:
            filters.append(User.email.ilike(f"%{email}%"))
        
        if active is not None:
            filters.append(User.active == active)
        
        query = db.query(User).filter(and_(*filters)).options(joinedload(User.evaluator))
        users = query.offset(skip).limit(limit).all()

        user_data = []
        for user in users:
            user_dict = {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "active": user.active,
                "email_verified_at": user.email_verified_at,
                "remember_token": user.remember_token,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "deleted_at": user.deleted_at,
                "evaluator": None
            }
            
            if user.evaluator:
                user_dict["evaluator"] = {
                    "id": user.evaluator.id,
                    "PIN": user.evaluator.PIN,
                    "created_at": user.evaluator.created_at
                }
            
            user_data.append(user_dict)
        
        return UserListResponse(
            status=True,
            message="Users retrieved successfully",
            data=user_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving users: {str(e)}"
        )

@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        query = db.query(User).filter(User.deleted_at == None).options(joinedload(User.evaluator))
        
        user = query.filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_dict = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "active": user.active,
            "email_verified_at": user.email_verified_at,
            "remember_token": user.remember_token,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "deleted_at": user.deleted_at,
            "evaluator": None
        }
        
        if user.evaluator:
            user_dict["evaluator"] = {
                "id": user.evaluator.id,
                "PIN": user.evaluator.PIN,
                "created_at": user.evaluator.created_at
            }
        
        return UserDetailResponse(
            status=True,
            message="User retrieved successfully",
            data=user_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user: {str(e)}"
        )

@router.post("/", response_model=UserDetailResponse)
async def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        hashed_password = User.get_password_hash(user_data.password)
        
        user = User(
            name=user_data.name,
            email=user_data.email,
            password=hashed_password,
            active=user_data.active
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        user_dict = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "active": user.active,
            "email_verified_at": user.email_verified_at,
            "remember_token": user.remember_token,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "deleted_at": user.deleted_at,
            "evaluator": None
        }
        
        return UserDetailResponse(
            status=True,
            message="User created successfully",
            data=user_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )

@router.put("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        if user_data.email and user_data.email != user.email:
            existing_user = db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="E-mail já cadastrado"
                )
        
        update_data = user_data.dict(exclude_unset=True)
        
        if "password" in update_data:
            update_data["password"] = User.get_password_hash(update_data["password"])
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        user_dict = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "active": user.active,
            "email_verified_at": user.email_verified_at,
            "remember_token": user.remember_token,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
            "deleted_at": user.deleted_at,
            "evaluator": None
        }
        
        return UserDetailResponse(
            status=True,
            message="User updated successfully",
            data=user_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user: {str(e)}"
        )

@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        from datetime import datetime
        user.deleted_at = datetime.utcnow()
        user.active = False
        
        db.commit()
        
        return {
            "status": True,
            "message": "User deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting user: {str(e)}"
        ) 

@router.get("/export/csv")
async def export_users_csv(
    db: Session = Depends(get_db)
):
    """Exporta todos os usuários para CSV"""
    try:
        users = db.query(User).filter(User.deleted_at == None).all()
        
        # Criar arquivo temporário
        temp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.csv', encoding='utf-8')
        
        writer = csv.writer(temp_file)
        
        # Cabeçalhos
        headers = ["id", "name", "email", "password", "active", "email_verified_at", "remember_token", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for user in users:
            writer.writerow([
                user.id,
                user.name,
                user.email,
                user.password,
                1 if user.active else 0,
                user.email_verified_at.isoformat() if user.email_verified_at else "",
                user.remember_token or "",
                user.created_at.isoformat() if user.created_at else "",
                user.updated_at.isoformat() if user.updated_at else "",
                user.deleted_at.isoformat() if user.deleted_at else ""
            ])
        
        temp_file.close()
        
        return FileResponse(
            path=temp_file.name,
            filename="users_export.csv",
            media_type="text/csv"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar usuários: {str(e)}"
        )

@router.get("/import/molde")
async def download_user_molde():
    """Download do arquivo molde para usuários"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/user.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="user_molde.csv",
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
async def import_users_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa usuários de um arquivo CSV"""
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
                # Verificar se o usuário já existe
                existing_user = db.query(User).filter(User.email == row['email']).first()
                if existing_user:
                    errors.append(f"Linha {index + 2}: Email {row['email']} já existe")
                    continue
                
                # Criar novo usuário
                user = User(
                    name=row['name'],
                    email=row['email'],
                    password=User.get_password_hash(row['password']),
                    active=bool(row['active']) if 'active' in row else True
                )
                
                db.add(user)
                imported_count += 1

            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} usuários importados.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar usuários: {str(e)}"
        ) 