from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.category import Category
from app.schemas.category import (
    CategoryCreate, CategoryUpdate, CategoryListResponse, CategoryDetailResponse
)
from typing import Optional

router = APIRouter()

@router.get("/", response_model=CategoryListResponse)
async def get_categories(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get all categories with optional pagination and relations"""
    try:
        query = db.query(Category).filter(Category.deleted_at == None)
        
        if include_relations:
            query = query.options(
                joinedload(Category.projects),
                joinedload(Category.evaluators)
            )
        
        categories = query.offset(skip).limit(limit).all()
        
        category_data = []
        for category in categories:
            category_dict = {
                "id": category.id,
                "name": category.name,
                "created_at": category.created_at,
                "updated_at": category.updated_at,
                "deleted_at": category.deleted_at,
                "projects": [],
                "evaluators": []
            }
            
            if include_relations:
                category_dict["projects"] = [
                    {
                        "id": project.id,
                        "title": project.title,
                        "year": project.year,
                        "projectType": project.projectType
                    } for project in category.projects
                ]
                
                category_dict["evaluators"] = [
                    {
                        "id": evaluator.id,
                        "PIN": evaluator.PIN,
                        "user_id": evaluator.user_id
                    } for evaluator in category.evaluators
                ]
            
            category_data.append(category_dict)
        
        return CategoryListResponse(
            status=True,
            message="Categories retrieved successfully",
            data=category_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving categories: {str(e)}"
        )

@router.get("/{category_id}", response_model=CategoryDetailResponse)
async def get_category(
    category_id: int,
    include_relations: bool = Query(False, description="Include related data"),
    db: Session = Depends(get_db)
):
    """Get a specific category by ID"""
    try:
        query = db.query(Category).filter(Category.deleted_at == None)
        
        if include_relations:
            query = query.options(
                joinedload(Category.projects),
                joinedload(Category.evaluators)
            )
        
        category = query.filter(Category.id == category_id).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        category_dict = {
            "id": category.id,
            "name": category.name,
            "created_at": category.created_at,
            "updated_at": category.updated_at,
            "deleted_at": category.deleted_at,
            "projects": [],
            "evaluators": []
        }
        
        if include_relations:
            category_dict["projects"] = [
                {
                    "id": project.id,
                    "title": project.title,
                    "year": project.year,
                    "projectType": project.projectType
                } for project in category.projects
            ]
            
            category_dict["evaluators"] = [
                {
                    "id": evaluator.id,
                    "PIN": evaluator.PIN,
                    "user_id": evaluator.user_id
                } for evaluator in category.evaluators
            ]
        
        return CategoryDetailResponse(
            status=True,
            message="Category retrieved successfully",
            data=category_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving category: {str(e)}"
        )

@router.post("/", response_model=CategoryDetailResponse)
async def create_category(category_data: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    try:
        category = Category(name=category_data.name)
        
        db.add(category)
        db.commit()
        db.refresh(category)
        
        category_dict = {
            "id": category.id,
            "name": category.name,
            "created_at": category.created_at,
            "updated_at": category.updated_at,
            "deleted_at": category.deleted_at,
            "projects": [],
            "evaluators": []
        }
        
        return CategoryDetailResponse(
            status=True,
            message="Category created successfully",
            data=category_dict
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating category: {str(e)}"
        )

@router.put("/{category_id}", response_model=CategoryDetailResponse)
async def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing category"""
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        update_data = category_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        db.commit()
        db.refresh(category)
        
        category_dict = {
            "id": category.id,
            "name": category.name,
            "created_at": category.created_at,
            "updated_at": category.updated_at,
            "deleted_at": category.deleted_at,
            "projects": [],
            "evaluators": []
        }
        
        return CategoryDetailResponse(
            status=True,
            message="Category updated successfully",
            data=category_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating category: {str(e)}"
        )

@router.delete("/{category_id}")
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    """Soft delete a category"""
    try:
        category = db.query(Category).filter(Category.id == category_id).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        from datetime import datetime
        category.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Category deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting category: {str(e)}"
        ) 