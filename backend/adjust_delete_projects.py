import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import SessionLocal
from app.models.project import Project
from app.models.assessment import Assessment
from app.models.response import Response

def delete_specific_projects():
    """Delete specific projects by title"""
    # List of projects to delete
    projects_to_delete = [
        "MEDIDAS ANTROPOMÉTRICAS E DISCUSSÃO SOBRE RCQ NAS AULAS DE EDUCAÇÃO FÍSICA",
        "MAPEANDO O SUICÍDIO NO BRASIL: UMA ANÁLISE CARTOGRÁFICA",
        "DISCRIMINAÇÕES NO CONTEXTO ESCOLAR: DESAFIOS E POSSIBILIDADES",
        "O AMBIENTE ESCOLAR E A SAÚDE MENTAL DOS ESTUDANTES",
        "O CLUBE DA GENTILEZA NA PROMOÇÃO DA CONCIENTIZAÇÃO E DO BEM-ESTAR DA COMUNIDADE",
        "teste chris 1",
        "teste chris 2",
        "teste chris 3"
    ]
    
    # Initialize database session
    db = SessionLocal()
    
    try:
        print("🗑️  INICIANDO EXCLUSÃO DE PROJETOS ESPECÍFICOS")
        print("=" * 60)
        
        deleted_count = 0
        not_found_count = 0
        errors = []
        
        for project_title in projects_to_delete:
            print(f"\n🔍 Procurando projeto: {project_title}")
            
            # Find project by exact title match
            project = db.query(Project).filter(
                and_(
                    Project.title == project_title,
                    Project.deleted_at == None
                )
            ).first()
            
            if not project:
                print(f"  ❌ Projeto não encontrado")
                not_found_count += 1
                continue
            
            print(f"  ✅ Projeto encontrado: ID {project.id}")
            
            # Check for existing assessments
            assessments = db.query(Assessment).filter(
                Assessment.project_id == project.id
            ).all()
            
            if assessments:
                print(f"  ⚠️  Projeto possui {len(assessments)} avaliação(ões) associada(s)")
                print(f"  📋 IDs das avaliações: {[a.id for a in assessments]}")
                
                # Delete responses first, then assessments
                for assessment in assessments:
                    # Delete all responses for this assessment
                    responses = db.query(Response).filter(Response.assessment_id == assessment.id).all()
                    if responses:
                        print(f"    🗑️  Deletando {len(responses)} resposta(s) da avaliação {assessment.id}")
                        for response in responses:
                            db.delete(response)
                    
                    # Delete the assessment
                    print(f"    🗑️  Deletando avaliação {assessment.id}")
                    db.delete(assessment)
            
            # Hard delete the project
            print(f"  🗑️  Deletando projeto {project.id}")
            db.delete(project)
            deleted_count += 1
            
            print(f"  ✅ Projeto {project.id} deletado permanentemente")
        
        # Commit all changes
        db.commit()
        
        # Print summary
        print(f"\n📊 RESUMO DA EXCLUSÃO:")
        print(f"  ✅ Projetos deletados permanentemente: {deleted_count}")
        print(f"  ❌ Projetos não encontrados: {not_found_count}")
        print(f"  ❌ Erros: {len(errors)}")
        
        if errors:
            print(f"\n❌ ERROS ENCONTRADOS:")
            for error in errors:
                print(f"  - {error}")
        
        print(f"\n🎉 Processo de exclusão concluído!")
        
        # Show remaining projects count
        remaining_projects = db.query(Project).count()
        print(f"📈 Projetos restantes no sistema: {remaining_projects}")
        
    except Exception as e:
        print(f"❌ Erro durante a exclusão: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def list_projects_to_delete():
    """List all projects that will be deleted (for verification)"""
    projects_to_delete = [
        "MEDIDAS ANTROPOMÉTRICAS E DISCUSSÃO SOBRE RCQ NAS AULAS DE EDUCAÇÃO FÍSICA",
        "MAPEANDO O SUICÍDIO NO BRASIL: UMA ANÁLISE CARTOGRÁFICA",
        "DISCRIMINAÇÕES NO CONTEXTO ESCOLAR: DESAFIOS E POSSIBILIDADES",
        "O AMBIENTE ESCOLAR E A SAÚDE MENTAL DOS ESTUDANTES",
        "O CLUBE DA GENTILEZA NA PROMOÇÃO DA CONCIENTIZAÇÃO E DO BEM-ESTAR DA COMUNIDADE",
        "teste chris 1",
        "teste chris 2",
        "teste chris 3"
    ]
    
    db = SessionLocal()
    
    try:
        print("📋 VERIFICAÇÃO DOS PROJETOS A SEREM EXCLUÍDOS")
        print("=" * 60)
        
        for i, project_title in enumerate(projects_to_delete, 1):
            print(f"\n{i}. {project_title}")
            
            # Find project
            project = db.query(Project).filter(
                Project.title == project_title
            ).first()
            
            if project:
                # Count assessments
                assessments_count = db.query(Assessment).filter(
                    Assessment.project_id == project.id
                ).count()
                
                print(f"   ✅ Encontrado - ID: {project.id}, Avaliações: {assessments_count}")
            else:
                print(f"   ❌ Não encontrado")
        
        print(f"\n⚠️  ATENÇÃO: Esta operação irá DELETAR PERMANENTEMENTE os projetos encontrados!")
        print(f"   - Projetos serão removidos do banco de dados")
        print(f"   - Avaliações associadas serão deletadas")
        print(f"   - Respostas das avaliações serão deletadas")
        print(f"   - Esta ação NÃO PODE ser desfeita!")
        
    except Exception as e:
        print(f"❌ Erro durante a verificação: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    delete_specific_projects()

