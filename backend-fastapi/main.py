# -*- coding: utf-8 -*-
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, assessments, questions, responses
from app.database import engine
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Fecitel API",
    description="API para sistema de avaliacao de projetos Fecitel",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(assessments.router, prefix="/api", tags=["assessments"])
app.include_router(questions.router, prefix="/api", tags=["questions"])
app.include_router(responses.router, prefix="/api", tags=["responses"])

@app.get("/")
async def root():
    return {"message": "Fecitel API - Sistema de Avaliação de Projetos"} 