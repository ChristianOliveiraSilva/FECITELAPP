from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from datetime import datetime
from typing import Optional
import os

router = APIRouter()

@router.get("/current-year")
async def get_current_year_event(db: Session = Depends(get_db)):
    try:
        current_year = datetime.now().year
        
        event = db.query(Event).filter(
            Event.year == current_year,
            Event.deleted_at.is_(None)
        ).first()
        
        if not event:
            return {
                "status": True,
                "message": "Current year event retrieved successfully",
                "data": {
                    "id": None,
                    "year": current_year,
                    "app_primary_color": "#56BA54",
                    "app_font_color": "#FFFFFF",
                    "app_logo_url": "/uploads/events/IFecitel_logo.png",
                }
            }
        
        return {
            "status": True,
            "message": "Current year event retrieved successfully",
            "data": {
                "id": event.id,
                "year": event.year,
                "app_primary_color": event.app_primary_color,
                "app_font_color": event.app_font_color,
                "app_logo_url": f"{os.getenv('API_BASE_URL')}{event.app_logo_url}" if event.app_logo_url and not event.app_logo_url.startswith('http') else event.app_logo_url,
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving current year event: {str(e)}"
        )