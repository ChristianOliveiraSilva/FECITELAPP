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
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Category).filter(Category.deleted_at == None).options(
            joinedload(Category.projects),
            joinedload(Category.evaluators),
            joinedload(Category.main_category),
            joinedload(Category.sub_categories)
        )
        
        categories = query.offset(skip).limit(limit).all()
        
        category_data = []
        for category in categories:
            category_dict = {
                "id": category.id,
                "name": category.name,
                "main_category_id": category.main_category_id,
                "created_at": category.created_at,
                "updated_at": category.updated_at,
                "deleted_at": category.deleted_at,
                "projects": [],
                "evaluators": [],
                "main_category": None,
                "sub_categories": []
            }
            
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

            # Adiciona categoria pai se existir
            if category.main_category:
                category_dict["main_category"] = {
                    "id": category.main_category.id,
                    "name": category.main_category.name,
                    "main_category_id": category.main_category.main_category_id,
                    "created_at": category.main_category.created_at,
                    "updated_at": category.main_category.updated_at,
                    "deleted_at": category.main_category.deleted_at
                }

            # Adiciona sub-categorias se existirem
            if category.sub_categories:
                category_dict["sub_categories"] = [
                    {
                        "id": sub_cat.id,
                        "name": sub_cat.name,
                        "main_category_id": sub_cat.main_category_id,
                        "created_at": sub_cat.created_at,
                        "updated_at": sub_cat.updated_at,
                        "deleted_at": sub_cat.deleted_at
                    } for sub_cat in category.sub_categories
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
    db: Session = Depends(get_db)
):
    try:
        query = db.query(Category).filter(Category.deleted_at == None).options(
            joinedload(Category.projects),
            joinedload(Category.evaluators),
            joinedload(Category.main_category),
            joinedload(Category.sub_categories)
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
            "main_category_id": category.main_category_id,
            "created_at": category.created_at,
            "updated_at": category.updated_at,
            "deleted_at": category.deleted_at,
            "projects": [],
            "evaluators": [],
            "main_category": None,
            "sub_categories": []
        }
        
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

        # Adiciona categoria pai se existir
        if category.main_category:
            category_dict["main_category"] = {
                "id": category.main_category.id,
                "name": category.main_category.name,
                "main_category_id": category.main_category.main_category_id,
                "created_at": category.main_category.created_at,
                "updated_at": category.main_category.updated_at,
                "deleted_at": category.main_category.deleted_at
            }

        # Adiciona sub-categorias se existirem
        if category.sub_categories:
            category_dict["sub_categories"] = [
                {
                    "id": sub_cat.id,
                    "name": sub_cat.name,
                    "main_category_id": sub_cat.main_category_id,
                    "created_at": sub_cat.created_at,
                    "updated_at": sub_cat.updated_at,
                    "deleted_at": sub_cat.deleted_at
                } for sub_cat in category.sub_categories
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
    try:
        if category_data.main_category_id:
            parent_category = db.query(Category).filter(
                Category.id == category_data.main_category_id,
                Category.deleted_at == None
            ).first()
            if not parent_category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria pai não encontrada"
                )

        category = Category(
            name=category_data.name,
            main_category_id=category_data.main_category_id
        )
        
        db.add(category)
        db.commit()
        db.refresh(category)
        
        category_dict = {
            "id": category.id,
            "name": category.name,
            "main_category_id": category.main_category_id,
            "created_at": category.created_at,
            "updated_at": category.updated_at,
            "deleted_at": category.deleted_at,
            "projects": [],
            "evaluators": [],
            "main_category": None,
            "sub_categories": []
        }
        
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

        # Adiciona categoria pai se existir
        if category.main_category:
            category_dict["main_category"] = {
                "id": category.main_category.id,
                "name": category.main_category.name,
                "main_category_id": category.main_category.main_category_id,
                "created_at": category.main_category.created_at,
                "updated_at": category.main_category.updated_at,
                "deleted_at": category.main_category.deleted_at
            }

        # Adiciona sub-categorias se existirem
        if category.sub_categories:
            category_dict["sub_categories"] = [
                {
                    "id": sub_cat.id,
                    "name": sub_cat.name,
                    "main_category_id": sub_cat.main_category_id,
                    "created_at": sub_cat.created_at,
                    "updated_at": sub_cat.updated_at,
                    "deleted_at": sub_cat.deleted_at
                } for sub_cat in category.sub_categories
            ]
        
        return CategoryDetailResponse(
            status=True,
            message="Category created successfully",
            data=category_dict
        )
    except HTTPException:
        raise
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
    try:
        if category_data.main_category_id:
            parent_category = db.query(Category).filter(
                Category.id == category_data.main_category_id,
                Category.deleted_at == None
            ).first()

            if not parent_category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Categoria pai não encontrada"
                )
        category = db.query(Category).filter(Category.id == category_id).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )
        
        if category_data.main_category_id is not None:
            if category_data.main_category_id == category_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category cannot be its own parent"
                )
            
            if category_data.main_category_id:
                parent_category = db.query(Category).filter(
                    Category.id == category_data.main_category_id,
                    Category.deleted_at == None
                ).first()
                if not parent_category:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Parent category not found"
                    )
        
        update_data = category_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)
        
        db.commit()
        db.refresh(category)
        
        category_dict = {
            "id": category.id,
            "name": category.name,
            "main_category_id": category.main_category_id,
            "created_at": category.created_at,
            "updated_at": category.updated_at,
            "deleted_at": category.deleted_at,
            "projects": [],
            "evaluators": [],
            "main_category": None,
            "sub_categories": []
        }
        
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

        # Adiciona categoria pai se existir
        if category.main_category:
            category_dict["main_category"] = {
                "id": category.main_category.id,
                "name": category.main_category.name,
                "main_category_id": category.main_category.main_category_id,
                "created_at": category.main_category.created_at,
                "updated_at": category.main_category.updated_at,
                "deleted_at": category.main_category.deleted_at
            }

        # Adiciona sub-categorias se existirem
        if category.sub_categories:
            category_dict["sub_categories"] = [
                {
                    "id": sub_cat.id,
                    "name": sub_cat.name,
                    "main_category_id": sub_cat.main_category_id,
                    "created_at": sub_cat.created_at,
                    "updated_at": sub_cat.updated_at,
                    "deleted_at": sub_cat.deleted_at
                } for sub_cat in category.sub_categories
            ]
        
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