from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    main_category_id: Optional[int] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    main_category_id: Optional[int] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]

    class Config:
        from_attributes = True

class CategoryWithRelations(CategoryResponse):
    projects: List[dict] = []
    evaluators: List[dict] = []
    main_category: Optional['CategoryResponse'] = None
    sub_categories: List['CategoryResponse'] = []

class CategoryListResponse(BaseModel):
    status: bool
    message: str
    data: List[CategoryWithRelations] = []

class CategoryDetailResponse(BaseModel):
    status: bool
    message: str
    data: CategoryWithRelations