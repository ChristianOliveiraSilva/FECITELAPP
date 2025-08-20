from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import users, evaluators, students, schools, categories, projects, awards, assessments, questions, responses, documents, cards, events, password_reset_configs
from app.routers.mobile import auth, assessments as mobile_assessments, questions as mobile_questions, responses as mobile_responses, events as mobile_events
from app.routers import web_auth
from app.database import engine, Base
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
app.include_router(auth.router, prefix="/api/v3/mobile", tags=["auth"])
# Rotas de avaliações para o aplicativo mobile
app.include_router(mobile_assessments.router, prefix="/api/v3/mobile", tags=["assessments"])
# Rotas de questões para o aplicativo mobile
app.include_router(mobile_questions.router, prefix="/api/v3/mobile", tags=["questions"])
# Rotas de respostas para o aplicativo mobile
app.include_router(mobile_responses.router, prefix="/api/v3/mobile", tags=["responses"])
# Rotas de eventos para o aplicativo mobile
app.include_router(mobile_events.router, prefix="/api/v3/mobile/events", tags=["events"])

# Rotas de autenticação para o sistema web
app.include_router(web_auth.router, prefix="/api/v3/auth", tags=["auth"])

# Rotas de usuários
app.include_router(users.router, prefix="/api/v3/users", tags=["users"])
# Rotas de avaliadores
app.include_router(evaluators.router, prefix="/api/v3/evaluators", tags=["evaluators"])
# Rotas de estudantes
app.include_router(students.router, prefix="/api/v3/students", tags=["students"])
# Rotas de escolas
app.include_router(schools.router, prefix="/api/v3/schools", tags=["schools"])
# Rotas de categorias
app.include_router(categories.router, prefix="/api/v3/categories", tags=["categories"])
# Rotas de projetos
app.include_router(projects.router, prefix="/api/v3/projects", tags=["projects"])
# Rotas de premiações
app.include_router(awards.router, prefix="/api/v3/awards", tags=["awards"])
# Rotas de avaliações
app.include_router(assessments.router, prefix="/api/v3/assessments", tags=["assessments"])
# Rotas de questões
app.include_router(questions.router, prefix="/api/v3/questions", tags=["questions"])
# Rotas de respostas
app.include_router(responses.router, prefix="/api/v3/responses", tags=["responses"])
# Rotas de eventos
app.include_router(events.router, prefix="/api/v3/events", tags=["events"])
# Rotas de configuração de redefinição de senha
app.include_router(password_reset_configs.router, prefix="/api/v3/password-reset-configs", tags=["password-reset-configs"])

# Rotas de cards
app.include_router(cards.router, prefix="/api/v3/cards", tags=["cards"])

# Rotas de documentos
app.include_router(documents.router, prefix="/api/v3/docs", tags=["documents"])

uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Fecitel API - Sistema de Avaliação de Projetos"} 