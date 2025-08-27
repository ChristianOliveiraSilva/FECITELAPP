from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.schemas.event import (
    EventListResponse, EventDetailResponse
)
from typing import Optional
import uuid
from pathlib import Path
import shutil
import csv
import io
import pandas as pd
from datetime import datetime
import os

router = APIRouter()

UPLOAD_DIR = Path("uploads/events")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def save_uploaded_file(file: UploadFile) -> str:
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
            message="Eventos recuperados com sucesso",
            data=event_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar eventos: {str(e)}"
        )

@router.get("/{event_id}", response_model=EventDetailResponse)
async def get_event(
    event_id: int,
    db: Session = Depends(get_db)
):
    try:
        event = db.query(Event).filter(Event.id == event_id, Event.deleted_at == None).first()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado"
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
            message="Evento recuperado com sucesso",
            data=event_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao recuperar evento: {str(e)}"
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
        existing_event = db.query(Event).filter(Event.year == year, Event.deleted_at == None).first()
        if existing_event:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Evento para o ano {year} já existe"
            )
        
        allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]
        if logo.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tipo de arquivo inválido. Apenas imagens JPEG, PNG, GIF e WebP são permitidas."
            )
        
        logo.file.seek(0, 2)
        file_size = logo.file.tell()
        logo.file.seek(0)
        
        if file_size > 5 * 1024 * 1024:  # 5MB
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Arquivo muito grande. O tamanho máximo é 5MB."
            )
        
        logo_url = save_uploaded_file(logo)
        
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
            message="Evento criado com sucesso com logo",
            data=event_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar evento: {str(e)}"
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
    try:
        event = db.query(Event).filter(Event.id == event_id, Event.deleted_at == None).first()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado"
            )
        
        if year is not None and year != event.year:
            existing_event = db.query(Event).filter(
                Event.year == year,
                Event.id != event_id,
                Event.deleted_at == None
            ).first()
            if existing_event:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Evento para o ano {year} já existe"
                )
        
        if year is not None:
            event.year = year
        if app_primary_color is not None:
            event.app_primary_color = app_primary_color
        if app_font_color is not None:
            event.app_font_color = app_font_color
        
        if logo is not None:
            allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"]
            if logo.content_type not in allowed_types:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tipo de arquivo inválido. Apenas imagens JPEG, PNG, GIF e WebP são permitidas."
                )
            
            logo.file.seek(0, 2)
            file_size = logo.file.tell()
            logo.file.seek(0)
            
            if file_size > 5 * 1024 * 1024:  # 5MB
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Arquivo muito grande. O tamanho máximo é 5MB."
                )
            
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
            message="Evento atualizado com sucesso",
            data=event_dict
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar evento: {str(e)}"
        )

@router.delete("/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado"
            )
        
        from datetime import datetime
        event.deleted_at = datetime.utcnow()
        
        db.commit()
        
        return {
            "status": True,
            "message": "Evento excluído com sucesso"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir evento: {str(e)}"
        )

@router.get("/export/csv")
async def export_events_csv(
    db: Session = Depends(get_db)
):
    """Exporta todos os eventos para CSV"""
    try:
        events = db.query(Event).filter(Event.deleted_at == None).all()
        
        # Criar buffer de memória para o CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Cabeçalhos
        headers = ["id", "year", "app_primary_color", "app_font_color", "app_logo_url", "created_at", "updated_at", "deleted_at"]
        writer.writerow(headers)
        
        # Dados
        for event in events:
            writer.writerow([
                event.id,
                event.year,
                event.app_primary_color or "",
                event.app_font_color or "",
                event.app_logo_url or "",
                event.created_at.isoformat() if event.created_at else "",
                event.updated_at.isoformat() if event.updated_at else "",
                event.deleted_at.isoformat() if event.deleted_at else ""
            ])
        
        output.seek(0)
        csv_content = output.getvalue()
        output.close()
        
        return {
            "status": True,
            "message": "Eventos exportados com sucesso",
            "data": csv_content
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao exportar eventos: {str(e)}"
        )

@router.get("/import/molde")
async def download_event_molde():
    """Download do arquivo molde para eventos"""
    try:
        # Caminho do arquivo molde
        molde_path = "uploads/moldes/event.csv"
        
        # Verificar se o arquivo existe
        if not os.path.exists(molde_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Arquivo molde não encontrado"
            )
        
        return FileResponse(
            path=molde_path,
            filename="event_molde.csv",
            media_type="text/csv"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao baixar molde: {str(e)}"
        )

@router.post("/import")
async def import_events_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importa eventos de um arquivo CSV"""
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Arquivo deve ser um CSV"
            )
        
        # Ler o arquivo CSV
        content = await file.read()
        csv_text = content.decode('utf-8')
        
        # Usar pandas para ler o CSV
        df = pd.read_csv(io.StringIO(csv_text))
        
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Verificar se o evento já existe
                existing_event = db.query(Event).filter(Event.year == row['year']).first()
                if existing_event:
                    errors.append(f"Linha {index + 2}: Evento para o ano {row['year']} já existe")
                    continue
                
                # Criar novo evento
                event = Event(
                    year=row['year'],
                    app_primary_color=row.get('app_primary_color'),
                    app_font_color=row.get('app_font_color'),
                    app_logo_url=row.get('app_logo_url')
                )
                
                db.add(event)
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Linha {index + 2}: {str(e)}")
        
        db.commit()
        
        return {
            "status": True,
            "message": f"Importação concluída. {imported_count} eventos importados.",
            "data": {
                "imported_count": imported_count,
                "errors": errors
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao importar eventos: {str(e)}"
        ) 