from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.password_reset_config import PasswordResetConfig
from app.schemas.password_reset_config import (
    PasswordResetConfigCreate, PasswordResetConfigUpdate, 
    PasswordResetConfigListResponse, PasswordResetConfigDetailResponse
)

router = APIRouter()

@router.get("/", response_model=PasswordResetConfigListResponse)
async def get_password_reset_configs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(PasswordResetConfig).filter(PasswordResetConfig.deleted_at == None)
        configs = query.offset(skip).limit(limit).all()
        
        config_data = []
        for config in configs:
            config_dict = {
                "id": config.id,
                "mail_template": config.mail_template,
                "created_at": config.created_at,
                "updated_at": config.updated_at,
                "deleted_at": config.deleted_at
            }
            config_data.append(config_dict)
        
        return PasswordResetConfigListResponse(
            status=True,
            message="Configurações de redefinição de senha recuperadas com sucesso",
            data=config_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar configurações de redefinição de senha: {str(e)}"
        )

@router.get("/{config_id}", response_model=PasswordResetConfigDetailResponse)
async def get_password_reset_config(
    config_id: int,
    db: Session = Depends(get_db)
):
    try:
        config = db.query(PasswordResetConfig).filter(
            PasswordResetConfig.id == config_id,
            PasswordResetConfig.deleted_at == None
        ).first()
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuração de redefinição de senha não encontrada"
            )
        
        config_dict = {
            "id": config.id,
            "mail_template": config.mail_template,
            "created_at": config.created_at,
            "updated_at": config.updated_at,
            "deleted_at": config.deleted_at
        }
        
        return PasswordResetConfigDetailResponse(
            status=True,
            message="Configuração de redefinição de senha recuperada com sucesso",
            data=config_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar configuração de redefinição de senha: {str(e)}"
        )

@router.put("/{config_id}", response_model=PasswordResetConfigDetailResponse)
async def update_password_reset_config(
    config_id: int,
    config_data: PasswordResetConfigUpdate,
    db: Session = Depends(get_db)
):
    try:
        config = db.query(PasswordResetConfig).filter(
            PasswordResetConfig.id == config_id,
            PasswordResetConfig.deleted_at == None
        ).first()
        
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Configuração de redefinição de senha não encontrada"
            )
        
        update_data = config_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(config, field, value)
        
        db.commit()
        db.refresh(config)
        
        config_dict = {
            "id": config.id,
            "mail_template": config.mail_template,
            "created_at": config.created_at,
            "updated_at": config.updated_at,
            "deleted_at": config.deleted_at
        }
        
        return PasswordResetConfigDetailResponse(
            status=True,
            message="Configuração de redefinição de senha atualizada com sucesso",
            data=config_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar configuração de redefinição de senha: {str(e)}"
        )
