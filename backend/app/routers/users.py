from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserUpdate, UserListResponse, UserDetailResponse, UserWithRelations
)
from typing import Optional

router = APIRouter()

@router.get("/", response_model=UserListResponse)
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(User).filter(User.deleted_at == None).options(joinedload(User.evaluator))
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