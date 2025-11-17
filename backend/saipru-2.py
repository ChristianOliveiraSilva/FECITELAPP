#!/usr/bin/env python3

import sys
import os
import random
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.project import Project

def generate_unique_external_id(db: Session, existing_ids: set) -> str:
    while True:
        external_id = str(random.randint(1000, 9999))
        if external_id not in existing_ids:
            existing_project = db.query(Project).filter(
                Project.external_id == external_id,
                Project.deleted_at == None
            ).first()
            if not existing_project:
                existing_ids.add(external_id)
                return external_id

def update_projects_external_id(db: Session):
    projects = db.query(Project).filter(Project.deleted_at == None).all()
    
    if not projects:
        print("Nenhum projeto encontrado.")
        return
    
    existing_ids = set()
    updated_count = 0
    
    for project in projects:
        new_external_id = generate_unique_external_id(db, existing_ids)
        project.external_id = new_external_id
        updated_count += 1
        print(f"✅ Projeto ID {project.id} atualizado com external_id: {new_external_id}")
    
    db.commit()
    print(f"\n=== RESULTADO ===")
    print(f"Total de projetos atualizados: {updated_count}")

if __name__ == "__main__":
    db = SessionLocal()
    
    try:
        update_projects_external_id(db)
        print("\n✅ Atualização concluída com sucesso!")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro durante a atualização: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

