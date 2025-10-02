import sys
import os
import csv
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.database import SessionLocal
from app.models.project import Project
from app.models.assessment import Assessment
from app.models.evaluator import Evaluator
from app.models.user import User

def export_to_csv(data, headers):
    """Export data to CSV file"""
    try:
        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"relatorio_projetos_avaliadores_{timestamp}.csv"
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            
            # Write headers
            writer.writerow(headers)
            
            # Write data
            writer.writerows(data)
        
        print(f"\n💾 Arquivo CSV exportado: {filename}")
        print(f"   Total de linhas: {len(data)}")
        
    except Exception as e:
        print(f"❌ Erro ao exportar CSV: {e}")

def get_project_evaluators():
    """Get all projects with their evaluator assignments"""
    # Initialize database session
    db = SessionLocal()
    
    try:
        # Get all projects with their assessments and evaluators
        from sqlalchemy.orm import joinedload
        
        projects = db.query(Project).filter(
            Project.deleted_at == None
        ).options(
            joinedload(Project.assessments).joinedload(Assessment.evaluator).joinedload(Evaluator.user)
        ).all()
        
        print("📊 RELATÓRIO DE PROJETOS E AVALIADORES")
        print("=" * 80)
        print(f"{'ID PROJETO':<12} {'ID AVAL 1':<12} {'ID AVAL 2':<12} {'ID AVAL 3':<12} {'ID AVAL 4':<12} {'TOTAL':<8}")
        print("-" * 80)
        
        # Prepare data for CSV
        csv_data = []
        csv_headers = ['ID_PROJETO', 'TITULO', 'ID_AVALIADOR_1', 'ID_AVALIADOR_2', 'ID_AVALIADOR_3', 'ID_AVALIADOR_4', 'TOTAL_AVALIADORES', 'NOMES_AVALIADORES']
        
        total_projects = 0
        projects_with_evaluators = 0
        projects_without_evaluators = 0
        
        for project in projects:
            total_projects += 1
            
            # Get assessments for this project
            assessments = [a for a in project.assessments if a.deleted_at is None]
            
            # Sort assessments by evaluator ID for consistent ordering
            assessments.sort(key=lambda x: x.evaluator_id)
            
            # Prepare evaluator IDs
            evaluator_ids = []
            evaluator_names = []
            for i in range(4):  # Maximum 4 evaluators
                if i < len(assessments):
                    evaluator_ids.append(str(assessments[i].evaluator_id))
                    evaluator_name = assessments[i].evaluator.user.name if assessments[i].evaluator and assessments[i].evaluator.user else "N/A"
                    evaluator_names.append(f"{assessments[i].evaluator_id} ({evaluator_name})")
                else:
                    evaluator_ids.append("-")
                    evaluator_names.append("-")
            
            # Count total evaluators
            total_evaluators = len(assessments)
            
            # Print project info
            print(f"{project.id:<12} {evaluator_ids[0]:<12} {evaluator_ids[1]:<12} {evaluator_ids[2]:<12} {evaluator_ids[3]:<12} {total_evaluators:<8}")
            
            # Prepare CSV row
            csv_row = [
                project.id,
                project.title,
                evaluator_ids[0],
                evaluator_ids[1],
                evaluator_ids[2],
                evaluator_ids[3],
                total_evaluators,
                ", ".join([name for name in evaluator_names if name != "-"])
            ]
            csv_data.append(csv_row)
            
            # Count projects with/without evaluators
            if total_evaluators > 0:
                projects_with_evaluators += 1
            else:
                projects_without_evaluators += 1
        
        print("-" * 80)
        print(f"\n📈 ESTATÍSTICAS:")
        print(f"  Total de projetos: {total_projects}")
        print(f"  Projetos com avaliadores: {projects_with_evaluators}")
        print(f"  Projetos sem avaliadores: {projects_without_evaluators}")
        
        # Show projects without evaluators
        if projects_without_evaluators > 0:
            print(f"\n⚠️  PROJETOS SEM AVALIADORES:")
            for project in projects:
                assessments = [a for a in project.assessments if a.deleted_at is None]
                if len(assessments) == 0:
                    print(f"  - ID {project.id}: {project.title}")
        
        # Show evaluator details for projects with evaluators
        print(f"\n👥 DETALHES DOS AVALIADORES:")
        print("-" * 100)
        print(f"{'ID PROJETO':<12} {'TÍTULO':<30} {'AVALIADORES':<50}")
        print("-" * 100)
        
        for project in projects:
            assessments = [a for a in project.assessments if a.deleted_at is None]
            if len(assessments) > 0:
                evaluator_names = []
                for assessment in assessments:
                    evaluator_name = assessment.evaluator.user.name if assessment.evaluator and assessment.evaluator.user else "N/A"
                    evaluator_names.append(f"{assessment.evaluator_id} ({evaluator_name})")
                
                evaluators_str = ", ".join(evaluator_names)
                title_short = project.title[:27] + "..." if len(project.title) > 30 else project.title
                print(f"{project.id:<12} {title_short:<30} {evaluators_str:<50}")
        
        # Export to CSV
        export_to_csv(csv_data, csv_headers)
        
        print(f"\n✅ Relatório gerado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao gerar relatório: {e}")
        raise
    finally:
        db.close()

def get_evaluator_statistics():
    """Get statistics about evaluators"""
    db = SessionLocal()
    
    try:
        # Get all evaluators with their assessment count
        from sqlalchemy.orm import joinedload
        
        evaluators = db.query(Evaluator).filter(
            Evaluator.deleted_at == None
        ).options(
            joinedload(Evaluator.user),
            joinedload(Evaluator.assessments)
        ).all()
        
        print(f"\n📊 ESTATÍSTICAS DOS AVALIADORES:")
        print("=" * 60)
        print(f"{'ID AVALIADOR':<15} {'NOME':<25} {'PROJETOS':<10}")
        print("-" * 60)
        
        for evaluator in evaluators:
            assessment_count = len([a for a in evaluator.assessments if a.deleted_at is None])
            evaluator_name = evaluator.user.name if evaluator.user else "N/A"
            print(f"{evaluator.id:<15} {evaluator_name:<25} {assessment_count:<10}")
        
        print("-" * 60)
        print(f"Total de avaliadores: {len(evaluators)}")
        
    except Exception as e:
        print(f"❌ Erro ao gerar estatísticas dos avaliadores: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🔍 Iniciando verificação de projetos e avaliadores...")
    get_project_evaluators()
    get_evaluator_statistics()
