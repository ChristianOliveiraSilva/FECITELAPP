import pandas as pd
import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import SessionLocal
from app.models.project import Project
from app.models.evaluator import Evaluator
from app.models.user import User
from app.models.assessment import Assessment

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

def find_project_by_code_or_title(db: Session, code: str, title: str):
    """Find project by external_id (code) or title"""
    # First try to find by external_id
    if pd.notna(code) and str(code).strip():
        project = db.query(Project).filter(
            and_(
                Project.external_id == str(code).strip(),
                Project.deleted_at == None
            )
        ).first()
        if project:
            return project
    
    # If not found by external_id, try by title
    if pd.notna(title) and str(title).strip():
        project = db.query(Project).filter(
            and_(
                Project.title.ilike(f"%{str(title).strip()}%"),
                Project.deleted_at == None
            )
        ).first()
        if project:
            return project
    
    return None

def find_evaluator_by_name(db: Session, evaluator_name: str):
    """Find evaluator by user name"""
    if pd.notna(evaluator_name) and str(evaluator_name).strip():
        evaluator = db.query(Evaluator).join(User).filter(
            and_(
                User.name.ilike(f"%{str(evaluator_name).strip()}%"),
                User.deleted_at == None,
                Evaluator.deleted_at == None
            )
        ).first()
        return evaluator
    return None

def create_assessment(db: Session, project_id: int, evaluator_id: int):
    """Create assessment linking project to evaluator"""
    # Check if assessment already exists
    existing_assessment = db.query(Assessment).filter(
        and_(
            Assessment.project_id == project_id,
            Assessment.evaluator_id == evaluator_id,
            Assessment.deleted_at == None
        )
    ).first()
    
    if existing_assessment:
        print(f"  ⚠️  Avaliação já existe para projeto {project_id} e avaliador {evaluator_id}")
        return existing_assessment
    
    # Create new assessment
    assessment = Assessment(
        project_id=project_id,
        evaluator_id=evaluator_id
    )
    
    db.add(assessment)
    return assessment

def process_excel_data():
    """Main function to process the Excel file and create assessments"""
    # Read Excel file
    excel_path = "DistribuiçãoDeTrabalhos.xlsx"
    df = read_excel_file(excel_path)
    
    if df is None:
        return
    
    # Initialize database session
    db = SessionLocal()
    
    try:
        created_assessments = 0
        skipped_assessments = 0
        errors = []
        
        print(f"\n🔄 Processando {len(df)} projetos...")
        
        for index, row in df.iterrows():
            print(f"\n--- Linha {index + 2} ---")
            
            # Get project data
            codigo = row.get('Código', '')
            titulo = row.get('Título', '')
            
            print(f"Projeto: {codigo} - {titulo}")
            
            # Find project
            project = find_project_by_code_or_title(db, codigo, titulo)
            if not project:
                error_msg = f"Projeto não encontrado: {codigo} - {titulo}"
                print(f"  ❌ {error_msg}")
                errors.append(f"Linha {index + 2}: {error_msg}")
                continue
            
            print(f"  ✅ Projeto encontrado: ID {project.id} - {project.title}")
            
            # Process each evaluator (Avaliador 1, 2, 3, Extra)
            evaluator_columns = ['Avaliador 1', 'Avaliador 2', 'Avaliador 3', 'Avaliador Extra']
            
            for col in evaluator_columns:
                evaluator_name = row.get(col, '')
                
                if pd.notna(evaluator_name) and str(evaluator_name).strip():
                    print(f"  🔍 Procurando avaliador: {evaluator_name}")
                    
                    # Find evaluator
                    evaluator = find_evaluator_by_name(db, evaluator_name)
                    if not evaluator:
                        error_msg = f"Avaliador não encontrado: {evaluator_name}"
                        print(f"    ❌ {error_msg}")
                        errors.append(f"Linha {index + 2}: {error_msg}")
                        continue
                    
                    print(f"    ✅ Avaliador encontrado: {evaluator.user.name} (ID: {evaluator.id})")
                    
                    # Create assessment
                    try:
                        assessment = create_assessment(db, project.id, evaluator.id)
                        if assessment.id:  # New assessment created
                            created_assessments += 1
                            print(f"    ✅ Avaliação criada: ID {assessment.id}")
                        else:
                            skipped_assessments += 1
                    except Exception as e:
                        error_msg = f"Erro ao criar avaliação: {str(e)}"
                        print(f"    ❌ {error_msg}")
                        errors.append(f"Linha {index + 2}: {error_msg}")
                else:
                    print(f"  ⚠️  {col} vazio, pulando...")
        
        # Commit all changes
        db.commit()
        
        # Print summary
        print(f"\n📊 RESUMO:")
        print(f"  ✅ Avaliações criadas: {created_assessments}")
        print(f"  ⚠️  Avaliações já existentes: {skipped_assessments}")
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
    print("🚀 Iniciando ajuste de categorias e criação de avaliações...")
    process_excel_data()
