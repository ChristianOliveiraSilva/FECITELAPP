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
    try:
        total_projetos = db.query(Project).filter(Project.deleted_at == None).count()
        
        projetos_sem_avaliacao = db.query(Project).filter(
            Project.deleted_at == None,
            ~Project.id.in_(
                db.query(Assessment.project_id).filter(Assessment.deleted_at == None).join(
                    Response, Assessment.id == Response.assessment_id
                ).filter(Response.deleted_at == None).distinct()
            )
        ).count()
        
        projetos_avaliados = db.query(Project).filter(
            Project.deleted_at == None,
            Project.id.in_(
                db.query(Assessment.project_id).filter(Assessment.deleted_at == None).join(
                    Response, Assessment.id == Response.assessment_id
                ).filter(Response.deleted_at == None).distinct()
            )
        ).count()
        
        avaliadores_ativos = db.query(Evaluator).filter(Evaluator.deleted_at == None).count()
        
        projetos_nao_avaliados = db.query(Project).filter(
            Project.deleted_at == None,
            ~Project.id.in_(
                db.query(Assessment.project_id).filter(Assessment.deleted_at == None).join(
                    Response, Assessment.id == Response.assessment_id
                ).filter(Response.deleted_at == None).distinct()
            )
        ).count()
        
        projetos_com_assessments_sem_respostas = db.query(Project).join(
            Assessment, Project.id == Assessment.project_id
        ).filter(
            Project.deleted_at == None,
            Assessment.deleted_at == None,
            ~Assessment.id.in_(
                db.query(Response.assessment_id).filter(Response.deleted_at == None).distinct()
            )
        ).distinct().count()
        
        faltam_2_avaliacoes = projetos_com_assessments_sem_respostas // 2
        
        faltam_1_avaliacao = projetos_com_assessments_sem_respostas - faltam_2_avaliacoes
        
        projetos_sem_assessments = db.query(Project).filter(
            Project.deleted_at == None,
            ~Project.id.in_(
                db.query(Assessment.project_id).filter(Assessment.deleted_at == None).distinct()
            )
        ).count()
        
        faltam_3_avaliacoes = projetos_sem_assessments
        
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