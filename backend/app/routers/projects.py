from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.project import Project
from app.models.category import Category
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectListResponse, ProjectDetailResponse
)
from typing import Optional

router = APIRouter()

@router.get("/", response_model=ProjectListResponse)
async def get_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get all projects with optional pagination and relations"""
    try:
        query = db.query(Project).filter(Project.deleted_at == None)
        
        if include_relations:
            query = query.options(
                joinedload(Project.category),
                joinedload(Project.students),
                joinedload(Project.assessments)
            )
        
        projects = query.offset(skip).limit(limit).all()
        
        project_data = []
        for project in projects:
            project_dict = {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "year": project.year,
                "category_id": project.category_id,
                "projectType": project.projectType,
                "external_id": project.external_id,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "deleted_at": project.deleted_at,
                "category": None,
                "students": [],
                "assessments": []
            }
            
            if include_relations:
                if project.category:
                    project_dict["category"] = {
                        "id": project.category.id,
                        "name": project.category.name
                    }
                
                project_dict["students"] = [
                    {
                        "id": student.id,
                        "name": student.name,
                        "school_grade": student.school_grade,
                        "school_id": student.school_id
                    } for student in project.students
                ]
                
                project_dict["assessments"] = [
                    {
                        "id": assessment.id,
                        "evaluator_id": assessment.evaluator_id,
                        "created_at": assessment.created_at
                    } for assessment in project.assessments
                ]
            
            project_data.append(project_dict)
        
        return ProjectListResponse(
            status=True,
            message="Projects retrieved successfully",
            data=project_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving projects: {str(e)}"
        )

@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project(
    project_id: int,
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get a specific project by ID"""
    try:
        query = db.query(Project).filter(Project.deleted_at == None)
        
        if include_relations:
            query = query.options(
                joinedload(Project.category),
                joinedload(Project.students),
                joinedload(Project.assessments)
            )
        
        project = query.filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        project_dict = {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "year": project.year,
            "category_id": project.category_id,
            "projectType": project.projectType,
            "external_id": project.external_id,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "deleted_at": project.deleted_at,
            "category": None,
            "students": [],
            "assessments": []
        }
        
        if include_relations:
            if project.category:
                project_dict["category"] = {
                    "id": project.category.id,
                    "name": project.category.name
                }
            
            project_dict["students"] = [
                {
                    "id": student.id,
                    "name": student.name,
                    "school_grade": student.school_grade,
                    "school_id": student.school_id
                } for student in project.students
            ]
            
            project_dict["assessments"] = [
                {
                    "id": assessment.id,
                    "evaluator_id": assessment.evaluator_id,
                    "created_at": assessment.created_at
                } for assessment in project.assessments
            ]
        
        return ProjectDetailResponse(
            status=True,
            message="Project retrieved successfully",
            data=project_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving project: {str(e)}"
        )

@router.post("/", response_model=ProjectDetailResponse)
async def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    try:
        # Check if category exists
        category = db.query(Category).filter(Category.id == project_data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category not found"
            )
        
        project = Project(
            title=project_data.title,
            description=project_data.description,
            year=project_data.year,
            category_id=project_data.category_id,
            projectType=project_data.projectType,
            external_id=project_data.external_id
        )
        
        db.add(project)
        db.commit()
        db.refresh(project)
        
        project_dict = {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "year": project.year,
            "category_id": project.category_id,
            "projectType": project.projectType,
            "external_id": project.external_id,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "deleted_at": project.deleted_at,
            "category": None,
            "students": [],
            "assessments": []
        }
        
        return ProjectDetailResponse(
            status=True,
            message="Project created successfully",
            data=project_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating project: {str(e)}"
        )

@router.put("/{project_id}", response_model=ProjectDetailResponse)
async def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing project"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Check if category exists if category_id is being updated
        if project_data.category_id and project_data.category_id != project.category_id:
            category = db.query(Category).filter(Category.id == project_data.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category not found"
                )
        
        # Update fields
        update_data = project_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)
        
        db.commit()
        db.refresh(project)
        
        project_dict = {
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "year": project.year,
            "category_id": project.category_id,
            "projectType": project.projectType,
            "external_id": project.external_id,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "deleted_at": project.deleted_at,
            "category": None,
            "students": [],
            "assessments": []
        }
        
        return ProjectDetailResponse(
            status=True,
            message="Project updated successfully",
            data=project_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating project: {str(e)}"
        )

@router.delete("/{project_id}")
async def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Soft delete a project"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Soft delete
        from datetime import datetime
        project.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Project deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting project: {str(e)}"
        ) 