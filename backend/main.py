from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers.crud import users, evaluators, students, supervisors, schools, categories, projects, awards, assessments, questions, responses, events
from app.routers.mobile import auth, assessments as mobile_assessments, questions as mobile_questions, responses as mobile_responses, events as mobile_events
from app.routers import web_auth, documents, cards, password_reset_configs, import_general
from app.database import engine, Base
from app.utils.auth import get_current_user
from pathlib import Path

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fecitel API",
    description="API para sistema de avaliacao de projetos Fecitel",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas de autenticação para o aplicativo mobile
app.include_router(auth.router, prefix="/api/v3/mobile", tags=["mobile"])
# Rotas de avaliações para o aplicativo mobile
app.include_router(mobile_assessments.router, prefix="/api/v3/mobile", tags=["mobile"])
# Rotas de questões para o aplicativo mobile
app.include_router(mobile_questions.router, prefix="/api/v3/mobile", tags=["mobile"])
# Rotas de respostas para o aplicativo mobile
app.include_router(mobile_responses.router, prefix="/api/v3/mobile", tags=["mobile"])
# Rotas de eventos para o aplicativo mobile
app.include_router(mobile_events.router, prefix="/api/v3/mobile/events", tags=["mobile"])

# Rotas de autenticação para o sistema web
app.include_router(web_auth.router, prefix="/api/v3/auth", tags=["auth"])

# Rotas de usuários (autenticação obrigatória)
app.include_router(users.router, prefix="/api/v3/users", tags=["users"], dependencies=[Depends(get_current_user)])
# Rotas de avaliadores (autenticação obrigatória)
app.include_router(evaluators.router, prefix="/api/v3/evaluators", tags=["evaluators"], dependencies=[Depends(get_current_user)])
# Rotas de estudantes (autenticação obrigatória)
app.include_router(students.router, prefix="/api/v3/students", tags=["students"], dependencies=[Depends(get_current_user)])
# Rotas de orientadores (autenticação obrigatória)
app.include_router(supervisors.router, prefix="/api/v3/supervisors", tags=["supervisors"], dependencies=[Depends(get_current_user)])
# Rotas de escolas (autenticação obrigatória)
app.include_router(schools.router, prefix="/api/v3/schools", tags=["schools"], dependencies=[Depends(get_current_user)])
# Rotas de categorias (autenticação obrigatória)
app.include_router(categories.router, prefix="/api/v3/categories", tags=["categories"], dependencies=[Depends(get_current_user)])
# Rotas de projetos (autenticação obrigatória)
app.include_router(projects.router, prefix="/api/v3/projects", tags=["projects"], dependencies=[Depends(get_current_user)])
# Rotas de premiações (autenticação obrigatória)
app.include_router(awards.router, prefix="/api/v3/awards", tags=["awards"], dependencies=[Depends(get_current_user)])
# Rotas de avaliações (autenticação obrigatória)
app.include_router(assessments.router, prefix="/api/v3/assessments", tags=["assessments"], dependencies=[Depends(get_current_user)])
# Rotas de questões (autenticação obrigatória)
app.include_router(questions.router, prefix="/api/v3/questions", tags=["questions"], dependencies=[Depends(get_current_user)])
# Rotas de respostas (autenticação obrigatória)
app.include_router(responses.router, prefix="/api/v3/responses", tags=["responses"], dependencies=[Depends(get_current_user)])
# Rotas de eventos (autenticação obrigatória)
app.include_router(events.router, prefix="/api/v3/events", tags=["events"], dependencies=[Depends(get_current_user)])
# Rotas de configuração de redefinição de senha (autenticação obrigatória)
app.include_router(password_reset_configs.router, prefix="/api/v3/password-reset-configs", tags=["password-reset-configs"], dependencies=[Depends(get_current_user)])

# Rotas de cards (autenticação obrigatória)
app.include_router(cards.router, prefix="/api/v3/cards", tags=["cards"], dependencies=[Depends(get_current_user)])

# Rotas de documentos (autenticação obrigatória)
app.include_router(documents.router, prefix="/api/v3/docs", tags=["documents"], dependencies=[Depends(get_current_user)])

# Rotas de importação (autenticação obrigatória)
app.include_router(import_general.router, prefix="/api/v3/general", tags=["import"], dependencies=[Depends(get_current_user)])

uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Fecitel API - Sistema de Avaliação de Projetos"} 