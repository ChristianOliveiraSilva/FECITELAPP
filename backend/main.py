from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import users, evaluators, students, schools, categories, projects, awards, assessments, questions, responses, documents, cards, events
from app.routers.mobile import auth, assessments as mobile_assessments, questions as mobile_questions, responses as mobile_responses, events as mobile_events
from app.routers import web_auth
from app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fecitel API",
    description="API para sistema de avaliacao de projetos Fecitel",
    version="3.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mobile routers
app.include_router(auth.router, prefix="/api/v3/mobile", tags=["auth"])
app.include_router(mobile_assessments.router, prefix="/api/v3/mobile", tags=["assessments"])
app.include_router(mobile_questions.router, prefix="/api/v3/mobile", tags=["questions"])
app.include_router(mobile_responses.router, prefix="/api/v3/mobile", tags=["responses"])
app.include_router(mobile_events.router, prefix="/api/v3/mobile/events", tags=["events"])

# Web authentication router
app.include_router(web_auth.router, prefix="/api/v3/auth", tags=["auth"])

# CRUD routers for all models
app.include_router(users.router, prefix="/api/v3/users", tags=["users"])
app.include_router(evaluators.router, prefix="/api/v3/evaluators", tags=["evaluators"])
app.include_router(students.router, prefix="/api/v3/students", tags=["students"])
app.include_router(schools.router, prefix="/api/v3/schools", tags=["schools"])
app.include_router(categories.router, prefix="/api/v3/categories", tags=["categories"])
app.include_router(projects.router, prefix="/api/v3/projects", tags=["projects"])
app.include_router(awards.router, prefix="/api/v3/awards", tags=["awards"])
app.include_router(assessments.router, prefix="/api/v3/assessments", tags=["assessments"])
app.include_router(questions.router, prefix="/api/v3/questions", tags=["questions"])
app.include_router(responses.router, prefix="/api/v3/responses", tags=["responses"])
app.include_router(documents.router, prefix="/api/v3/docs", tags=["documents"])
app.include_router(cards.router, prefix="/api/v3/cards", tags=["cards"])
app.include_router(events.router, prefix="/api/v3/events", tags=["events"])

# Mount static files for uploads
import os
from pathlib import Path

# Create uploads directory if it doesn't exist
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Fecitel API - Sistema de Avaliação de Projetos"} 