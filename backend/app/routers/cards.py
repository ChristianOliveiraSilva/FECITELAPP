from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, not_, exists, and_, func, distinct
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
            ~exists().where(
                and_(
                    Assessment.project_id == Project.id,
                    Assessment.deleted_at == None,
                    exists().where(
                        and_(
                            Response.assessment_id == Assessment.id,
                            Response.deleted_at == None
                        )
                    )
                )
            )
        ).count()
        
        projetos_avaliados = total_projetos - projetos_sem_avaliacao
        
        avaliadores_ativos = db.query(Evaluator).filter(Evaluator.deleted_at == None).count()
        
        faltam_1_avaliacao = (
            db.query(Project)
            .join(Assessment, and_(
                Assessment.project_id == Project.id,
                Assessment.deleted_at == None
            ))
            .join(Response, and_(
                Response.assessment_id == Assessment.id,
                Response.deleted_at == None
            ))
            .filter(Project.deleted_at == None)
            .group_by(Project.id)
            .having(func.count(distinct(Assessment.id)) == 2)
            .count()
        )

        faltam_2_avaliacoes = (
            db.query(Project)
            .join(Assessment, and_(
                Assessment.project_id == Project.id,
                Assessment.deleted_at == None
            ))
            .join(Response, and_(
                Response.assessment_id == Assessment.id,
                Response.deleted_at == None
            ))
            .filter(Project.deleted_at == None)
            .group_by(Project.id)
            .having(func.count(distinct(Assessment.id)) == 1)
            .count()
        )

        faltam_3_avaliacoes = projetos_sem_avaliacao
        
        progresso_geral = 0
        progresso_geral_inicial = 0
        if total_projetos > 0:
            progresso_geral_inicial = round((projetos_avaliados / total_projetos) * 100)
            soma_projetos_nao_finalizados = faltam_1_avaliacao + faltam_2_avaliacoes + faltam_3_avaliacoes
            progresso_geral = round(((total_projetos - soma_projetos_nao_finalizados) / total_projetos) * 100)

        return CardsResponse(
            total_projetos=total_projetos,
            trabalhos_para_avaliar=projetos_sem_avaliacao,
            trabalhos_avaliados=projetos_avaliados,
            avaliadores_ativos=avaliadores_ativos,
            progresso_geral=progresso_geral,
            progresso_geral_inicial=progresso_geral_inicial,
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