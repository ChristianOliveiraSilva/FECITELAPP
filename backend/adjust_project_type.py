import pandas as pd
import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import SessionLocal
from app.models.project import Project
from app.enums.project_type import ProjectType

def read_excel_file(file_path):
    """Read the Excel file and return a DataFrame"""
    try:
        df = pd.read_excel(file_path)
        print(f"✅ Arquivo Excel lido com sucesso. {len(df)} linhas encontradas.")
        print(f"Colunas encontradas: {list(df.columns)}")
        return df
    except Exception as e:
        print(f"❌ Erro ao ler arquivo Excel: {e}")
        return None

def parse_project_type(type_str):
    """Parse project type from string - get first letter and convert to uppercase"""
    if pd.isna(type_str) or not str(type_str).strip():
        return None
    
    type_str = str(type_str).strip()
    first_letter = type_str[0].upper()
    
    if first_letter == 'T':
        return ProjectType.TECHNICAL.value  # 1
    elif first_letter == 'C':
        return ProjectType.SCIENTIFIC.value  # 2
    else:
        print(f"⚠️  Tipo desconhecido: {type_str} (primeira letra: {first_letter})")
        return None

def find_project_by_title(db: Session, title: str):
    """Find project by title (case insensitive)"""
    if pd.isna(title) or not str(title).strip():
        return None
    
    project = db.query(Project).filter(
        and_(
            Project.title.ilike(f"%{str(title).strip()}%"),
            Project.deleted_at == None
        )
    ).first()
    
    return project

def update_project_type(db: Session, project_id: int, new_project_type: int):
    """Update project type in database"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return False
    
    old_type = project.projectType
    project.projectType = new_project_type
    
    print(f"  ✅ Projeto {project_id} atualizado: {old_type} → {new_project_type}")
    return True

def process_excel_data():
    """Main function to process the Excel file and update project types"""
    # Read Excel file
    excel_path = "tipos_projetos.xlsx"
    df = read_excel_file(excel_path)
    
    if df is None:
        return
    
    # Initialize database session
    db = SessionLocal()
    
    try:
        updated_projects = 0
        skipped_projects = 0
        not_found_projects = 0
        errors = []
        
        print(f"\n🔄 Processando {len(df)} projetos...")
        
        for index, row in df.iterrows():
            print(f"\n--- Linha {index + 2} ---")
            
            # Get project data
            titulo = row.get('TÍTULO', '')
            tipo = row.get('TIPO', '')
            
            print(f"Projeto: {titulo}")
            print(f"Tipo: {tipo}")
            
            # Parse project type
            project_type_value = parse_project_type(tipo)
            if project_type_value is None:
                error_msg = f"Tipo inválido: {tipo}"
                print(f"  ❌ {error_msg}")
                errors.append(f"Linha {index + 2}: {error_msg}")
                continue
            
            print(f"  📝 Tipo convertido: {project_type_value} ({'Tecnológico' if project_type_value == 1 else 'Científico'})")
            
            # Find project
            project = find_project_by_title(db, titulo)
            if not project:
                error_msg = f"Projeto não encontrado: {titulo}"
                print(f"  ❌ {error_msg}")
                errors.append(f"Linha {index + 2}: {error_msg}")
                not_found_projects += 1
                continue
            
            print(f"  ✅ Projeto encontrado: ID {project.id} - {project.title}")
            print(f"  📊 Tipo atual: {project.projectType} ({'Tecnológico' if project.projectType == 1 else 'Científico'})")
            
            # Check if update is needed
            if project.projectType == project_type_value:
                print(f"  ⚠️  Projeto já tem o tipo correto, pulando...")
                skipped_projects += 1
                continue
            
            # Update project type
            try:
                if update_project_type(db, project.id, project_type_value):
                    updated_projects += 1
                else:
                    error_msg = f"Erro ao atualizar projeto ID {project.id}"
                    print(f"  ❌ {error_msg}")
                    errors.append(f"Linha {index + 2}: {error_msg}")
            except Exception as e:
                error_msg = f"Erro ao atualizar projeto: {str(e)}"
                print(f"  ❌ {error_msg}")
                errors.append(f"Linha {index + 2}: {error_msg}")
        
        # Commit all changes
        db.commit()
        
        # Print summary
        print(f"\n📊 RESUMO:")
        print(f"  ✅ Projetos atualizados: {updated_projects}")
        print(f"  ⚠️  Projetos já corretos: {skipped_projects}")
        print(f"  ❌ Projetos não encontrados: {not_found_projects}")
        print(f"  ❌ Erros: {len(errors)}")
        
        if errors:
            print(f"\n❌ ERROS ENCONTRADOS:")
            for error in errors[:10]:  # Show first 10 errors
                print(f"  - {error}")
            if len(errors) > 10:
                print(f"  ... e mais {len(errors) - 10} erros")
        
        print(f"\n🎉 Processamento concluído!")
        
    except Exception as e:
        print(f"❌ Erro durante o processamento: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Iniciando ajuste de tipos de projetos...")
    process_excel_data()
