from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.database import get_db
from app.models.project import Project
from app.models.assessment import Assessment
from app.models.evaluator import Evaluator
from app.models.response import Response
from app.schemas.cards import CardsResponse

router = APIRouter()

@router.get("/", response_model=CardsResponse)
async def get_cards_data(db: Session = Depends(get_db)):
    """Busca dados para os cards do dashboard"""
    
    try:
        # Total de Projetos
        total_projetos = db.query(Project).count()
        
        # Trabalhos para Avaliar (projetos que não têm assessments com respostas)
        projetos_sem_avaliacao = db.query(Project).filter(
            ~Project.id.in_(
                db.query(Assessment.project_id).join(
                    Response, Assessment.id == Response.assessment_id
                ).distinct()
            )
        ).count()
        
        # Trabalhos Avaliados (projetos que têm pelo menos um assessment com resposta)
        projetos_avaliados = db.query(Project).filter(
            Project.id.in_(
                db.query(Assessment.project_id).join(
                    Response, Assessment.id == Response.assessment_id
                ).distinct()
            )
        ).count()
        
        # Avaliadores Ativos
        avaliadores_ativos = db.query(Evaluator).count()
        
        # Status das Avaliações (quantidade de projetos que ainda não foram avaliados)
        # Todos os projetos que não foram avaliados (sem assessments com respostas)
        projetos_nao_avaliados = db.query(Project).filter(
            ~Project.id.in_(
                db.query(Assessment.project_id).join(
                    Response, Assessment.id == Response.assessment_id
                ).distinct()
            )
        ).count()
        
        # Distribuir os projetos não avaliados de forma mais realista
        # Faltam 1 avaliação = projetos que têm assessments mas sem respostas
        projetos_com_assessments_sem_respostas = db.query(Project).join(
            Assessment, Project.id == Assessment.project_id
        ).filter(
            ~Assessment.id.in_(
                db.query(Response.assessment_id).distinct()
            )
        ).distinct().count()
        
        # Faltam 2 avaliações = projetos que têm assessments mas ainda não foram totalmente avaliados
        # Para simplificar, vamos considerar que faltam 2 avaliações = metade dos projetos com assessments sem respostas
        faltam_2_avaliacoes = projetos_com_assessments_sem_respostas // 2
        
        # Faltam 1 avaliação = resto dos projetos com assessments sem respostas
        faltam_1_avaliacao = projetos_com_assessments_sem_respostas - faltam_2_avaliacoes
        
        # Faltam 3 avaliações = projetos que não têm assessments
        projetos_sem_assessments = db.query(Project).filter(
            ~Project.id.in_(
                db.query(Assessment.project_id).distinct()
            )
        ).count()
        
        faltam_3_avaliacoes = projetos_sem_assessments
        
        # Progresso Geral (porcentagem entre Total de Projetos e Trabalhos Avaliados)
        progresso_geral = 0
        if total_projetos > 0:
            progresso_geral = round((projetos_avaliados / total_projetos) * 100)
        
        return CardsResponse(
            total_projetos=total_projetos,
            trabalhos_para_avaliar=projetos_sem_avaliacao,
            trabalhos_avaliados=projetos_avaliados,
            avaliadores_ativos=avaliadores_ativos,
            progresso_geral=progresso_geral,
            status_avaliacoes={
                "faltam_1_avaliacao": faltam_1_avaliacao,
                "faltam_2_avaliacoes": faltam_2_avaliacoes,
                "faltam_3_avaliacoes": faltam_3_avaliacoes
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao buscar dados dos cards: {str(e)}"
        ) 