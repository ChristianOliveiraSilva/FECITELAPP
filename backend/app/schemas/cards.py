from pydantic import BaseModel
from typing import Dict

class StatusAvaliacoes(BaseModel):
    faltam_1_avaliacao: int
    faltam_2_avaliacoes: int
    faltam_3_avaliacoes: int

class CardsResponse(BaseModel):
    total_projetos: int
    trabalhos_para_avaliar: int
    trabalhos_avaliados: int
    avaliadores_ativos: int
    progresso_geral: int
    progresso_geral_inicial: int
    status_avaliacoes: StatusAvaliacoes 