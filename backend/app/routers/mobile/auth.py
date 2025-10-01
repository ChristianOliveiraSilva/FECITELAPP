from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.evaluator import Evaluator
from app.models.assessment import Assessment
from app.models.project import Project
from app.schemas.auth import LoginRequest, LoginResponse, LogoutResponse, UserInfo, LoginData
from app.utils.auth import create_access_token, get_current_user
from datetime import timedelta
import random

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(User).join(Evaluator).filter(Evaluator.PIN == request.PIN).first()
        
        if not user:
            return LoginResponse(
                status=False,
                message="Nenhum usuário encontrado com o PIN fornecido"
            )
        
        if not user.active:
            return LoginResponse(
                status=False,
                message="Usuário inativo. Entre em contato com o administrador."
            )
        
        # Verificar se o avaliador tem pelo menos 3 avaliações
        evaluator = db.query(Evaluator).filter(Evaluator.user_id == user.id).first()
        if evaluator:
            current_assessments = db.query(Assessment).filter(
                Assessment.evaluator_id == evaluator.id,
                Assessment.deleted_at.is_(None)
            ).count()
            
            # Se o avaliador tem menos de 3 avaliações, criar 3 novas
            if current_assessments < 3:
                # Buscar projetos disponíveis do mesmo ano do avaliador
                available_projects = db.query(Project).filter(
                    Project.year == evaluator.year,
                    Project.deleted_at.is_(None)
                ).all()
                
                if available_projects:
                    # Selecionar 3 projetos aleatórios que ainda não foram atribuídos ao avaliador
                    existing_project_ids = db.query(Assessment.project_id).filter(
                        Assessment.evaluator_id == evaluator.id,
                        Assessment.deleted_at.is_(None)
                    ).all()
                    existing_project_ids = [pid[0] for pid in existing_project_ids]
                    
                    available_projects = [p for p in available_projects if p.id not in existing_project_ids]
                    
                    # Selecionar até 3 projetos aleatórios
                    projects_to_assign = random.sample(available_projects, min(3, len(available_projects)) - current_assessments)
                    
                    # Criar as avaliações
                    for project in projects_to_assign:
                        new_assessment = Assessment(
                            evaluator_id=evaluator.id,
                            project_id=project.id
                        )
                        db.add(new_assessment)

                    db.commit()
        
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        
        user_info = UserInfo(
            id=user.id,
            name=user.name,
            email=user.email
        )
        
        login_data = LoginData(
            user=user_info,
            plainTextToken=access_token
        )
        
        return LoginResponse(
            status=True,
            message="Usuário logado com sucesso",
            data=login_data.dict()
        )
        
    except Exception as e:
        return LoginResponse(
            status=False,
            message="Falha ao logar"
        )

@router.post("/logout", response_model=LogoutResponse)
async def logout(current_user: User = Depends(get_current_user)):
    try:
        return LogoutResponse(
            status=True,
            message="Logout realizado com sucesso",
            data={"result": True}
        )
    except Exception as e:
        return LogoutResponse(
            status=False,
            message="Falha ao deslogar"
        ) 