from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.schemas.event import (
    EventCreate, EventUpdate, EventListResponse, EventDetailResponse
)
from typing import Optional
import uuid
from pathlib import Path
import shutil

router = APIRouter()

UPLOAD_DIR = Path("uploads/events")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file and return the accessible URL"""
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return f"/uploads/events/{unique_filename}"

@router.get("/", response_model=EventListResponse)
async def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all events with optional pagination"""
    try:
        events = db.query(Event).filter(Event.deleted_at == None).offset(skip).limit(limit).all()
        
        event_data = []
        for event in events:
            event_dict = {
                "id": event.id,
                "year": event.year,
                "app_primary_color": event.app_primary_color,
                "app_font_color": event.app_font_color,
                "app_logo_url": event.app_logo_url,
                "created_at": event.created_at,
                "updated_at": event.updated_at,
                "deleted_at": event.deleted_at,
            }
            event_data.append(event_dict)
        
        return EventListResponse(
            status=True,
            message="Events retrieved successfully",
            data=event_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving events: {str(e)}"
        )

@router.get("/{event_id}", response_model=EventDetailResponse)
async def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific event by ID"""
    try:
        event = db.query(Event).filter(Event.id == event_id, Event.deleted_at == None).first()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        event_dict = {
            "id": event.id,
            "year": event.year,
            "app_primary_color": event.app_primary_color,
            "app_font_color": event.app_font_color,
            "app_logo_url": event.app_logo_url,
            "created_at": event.created_at,
            "updated_at": event.updated_at,
            "deleted_at": event.deleted_at,
        }
        
        return EventDetailResponse(
            status=True,
            message="Event retrieved successfully",
            data=event_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving event: {str(e)}"
        )

@router.post("/", response_model=EventDetailResponse)
async def create_event(
    year: int = Form(...),
    app_primary_color: str = Form(...),
    app_font_color: str = Form(...),
    logo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        existing_event = db.query(Event).filter(Event.year == year).first()
        if existing_event:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Event for year {year} already exists"
            )
        
        # Validate and save logo
        allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]
        if logo.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            )
        
        # Validate file size (max 5MB)
        logo.file.seek(0, 2)
        file_size = logo.file.tell()
        logo.file.seek(0)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 5MB."
            )
        
        # Save logo
        logo_url = save_uploaded_file(logo)
        
        # Create event
        event = Event(
            year=year,
            app_primary_color=app_primary_color,
            app_font_color=app_font_color,
            app_logo_url=logo_url
        )
        
        db.add(event)
        db.commit()
        db.refresh(event)
        
        event_dict = {
            "id": event.id,
            "year": event.year,
            "app_primary_color": event.app_primary_color,
            "app_logo_url": event.app_logo_url,
            "created_at": event.created_at,
            "updated_at": event.updated_at,
            "deleted_at": event.deleted_at,
        }
        
        return EventDetailResponse(
            status=True,
            message="Event created successfully with logo",
            data=event_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating event: {str(e)}"
        )

@router.put("/{event_id}", response_model=EventDetailResponse)
async def update_event(
    event_id: int,
    year: Optional[int] = Form(None),
    app_primary_color: Optional[str] = Form(None),
    app_font_color: Optional[str] = Form(None),
    logo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """Update an existing event"""
    try:
        event = db.query(Event).filter(Event.id == event_id, Event.deleted_at == None).first()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Check if year is being updated and if it conflicts with existing event
        if year is not None and year != event.year:
            existing_event = db.query(Event).filter(
                Event.year == year,
                Event.id != event_id,
                Event.deleted_at == None
            ).first()
            if existing_event:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Event for year {year} already exists"
                )
        
        # Update basic fields
        if year is not None:
            event.year = year
        if app_primary_color is not None:
            event.app_primary_color = app_primary_color
        if app_font_color is not None:
            event.app_font_color = app_font_color
        
        # Handle logo upload if provided
        if logo is not None:
            # Validate logo file type
            allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]
            if logo.content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
                )
            
            # Validate file size (max 5MB)
            logo.file.seek(0, 2)
            file_size = logo.file.tell()
            logo.file.seek(0)
            
            if file_size > 5 * 1024 * 1024:  # 5MB
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File too large. Maximum size is 5MB."
                )
            
            # Save new logo
            logo_url = save_uploaded_file(logo)
            event.app_logo_url = logo_url
        
        db.commit()
        db.refresh(event)
        
        event_dict = {
            "id": event.id,
            "year": event.year,
            "app_primary_color": event.app_primary_color,
            "app_font_color": event.app_font_color,
            "app_logo_url": event.app_logo_url,
            "created_at": event.created_at,
            "updated_at": event.updated_at,
            "deleted_at": event.deleted_at,
        }
        
        return EventDetailResponse(
            status=True,
            message="Event updated successfully",
            data=event_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating event: {str(e)}"
        )

@router.delete("/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    """Soft delete an event"""
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Soft delete
        from datetime import datetime
        event.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Event deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting event: {str(e)}"
        ) 