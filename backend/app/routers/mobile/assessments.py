from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.user import User
from app.models.evaluator import Evaluator
from app.models.assessment import Assessment
from app.models.project import Project
from app.models.student import Student
from app.models.category import Category
from app.schemas.mobile_assessment import AssessmentResponse
from app.utils.auth import get_current_evaluator
from datetime import datetime

router = APIRouter()

@router.get("/assessments", response_model=AssessmentResponse)
async def get_assessments(
    evaluator: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    try:
        if not evaluator:
            return AssessmentResponse(
                status=False,
                message="Usuário não autorizado ou não é um avaliador.",
                data=[]
            )
        
        current_year = datetime.now().year
        
        assessments = db.query(Assessment).join(Project).options(
            joinedload(Assessment.project).joinedload(Project.students),
            joinedload(Assessment.project).joinedload(Project.category)
        ).filter(
            Assessment.evaluator_id == evaluator.id,
            Project.year == current_year
        ).limit(20).all()

        assessment_data = []
        for assessment in assessments:
            project = assessment.project
            students = project.students
            
            assessment_dict = {
                "id": assessment.id,
                "evaluator_id": assessment.evaluator_id,
                "project_id": assessment.project_id,
                "has_response": assessment.has_response,
                "note": assessment.note,
                "project": {
                    "id": project.id,
                    "title": project.title,
                    "description": project.description,
                    "year": project.year,
                    "category_id": project.category_id,
                    "projectType": project.projectType,
                    "external_id": project.external_id,
                    "school_grade": project.school_grade,
                    "students": [
                        {
                            "id": student.id,
                            "name": student.name,
                            "school_grade": student.school_grade
                        } for student in students
                    ],
                    "category": {
                        "id": project.category.id,
                        "name": project.category.name
                    } if project.category else None
                },
                "responses": []
            }
            assessment_data.append(assessment_dict)
        
        return AssessmentResponse(
            status=True,
            message="Avaliações recuperadas com sucesso.",
            data=assessment_data
        )
        
    except Exception as e:
        return AssessmentResponse(
            status=False,
            message="Erro ao recuperar avaliações.",
            data=[]
        ) 