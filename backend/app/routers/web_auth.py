from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.evaluator import Evaluator
from app.models.password_reset import PasswordReset
from app.schemas.web_auth import (
    WebLoginRequest, WebLoginResponse, WebUserInfo,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from app.utils.auth import create_access_token, get_current_user
from app.services.email_service import email_service
from datetime import timedelta, datetime

router = APIRouter()

@router.post("/login", response_model=WebLoginResponse)
async def web_login(request: WebLoginRequest, db: Session = Depends(get_db)):
    try:
        # Buscar usuário por email
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha inválidos"
            )
        
        # Verificar senha
        if not User.verify_password(request.password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha inválidos"
            )
        
        # Verificar se o usuário está ativo
        if not user.active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário inativo"
            )
        
        # Create access token
        access_token_expires = timedelta(hours=8)  # Token mais longo para web
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        user_info = WebUserInfo(
            id=user.id,
            name=user.name,
            email=user.email,
            is_evaluator=db.query(Evaluator).filter(Evaluator.user_id == user.id).first() is not None
        )
        
        return WebLoginResponse(
            success=True,
            message="Login realizado com sucesso",
            user=user_info,
            token=access_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/logout")
async def web_logout(current_user: User = Depends(get_current_user)):
    try:
        return {
            "success": True,
            "message": "Logout realizado com sucesso"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.get("/me", response_model=WebUserInfo)
async def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        is_evaluator = db.query(Evaluator).filter(Evaluator.user_id == current_user.id).first() is not None
        
        return WebUserInfo(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            is_evaluator=is_evaluator
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == request.email).first()
        
        if not user:
            return ForgotPasswordResponse(
                success=True,
                message="Se o email existe em nossa base de dados, você receberá um link de recuperação."
            )
        
        if not user.active:
            return ForgotPasswordResponse(
                success=True,
                message="Se o email existe em nossa base de dados, você receberá um link de recuperação."
            )
        
        reset_token = PasswordReset.create_reset_token(db, user.id)
        
        email_sent = email_service.send_password_reset_email(
            user.email, 
            reset_token, 
            user.name
        )
        
        if email_sent:
            return ForgotPasswordResponse(
                success=True,
                message="Email de recuperação enviado com sucesso. Verifique sua caixa de entrada."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao enviar email de recuperação"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )

@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        password_reset = db.query(PasswordReset).filter(
            PasswordReset.token == request.token,
            PasswordReset.used == 0,
            PasswordReset.expires_at > datetime.utcnow()
        ).first()
        
        if not password_reset:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token inválido ou expirado"
            )
        
        user = db.query(User).filter(User.id == password_reset.user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário não encontrado"
            )
        
        user.password = User.get_password_hash(request.new_password)
        
        password_reset.used = 1
        
        db.commit()
        
        return ResetPasswordResponse(
            success=True,
            message="Senha redefinida com sucesso"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        ) 