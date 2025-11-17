#!/usr/bin/env python3

import csv
import sys
import os
import random
from datetime import datetime
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.question import Question
from app.models.user import User
from app.models.evaluator import Evaluator
from app.models.project import Project
from app.models.student import Student
from app.models.assessment import Assessment
from app.models.category import Category
from app.models.school import School
from app.enums.question_type import QuestionType

QUESTIONS = [
    "Clareza na definição do problema e pertinência do tema em relação à Agroindústria e à realidade local/regional.",
    "Coerência entre os objetivos propostos, metodologia aplicada e resultados obtidos.",
    "Domínio dos conceitos científicos e tecnológicos relacionados ao projeto; aplicação correta de procedimentos e técnicas agroindustriais.",
    "Grau de inovação, criatividade e potencial de aplicação prática do produto/processo desenvolvido.",
    "Avaliação dos produtos, protótipos ou amostras apresentados na mesa de demonstração (qualidade física, química sensorial.",
    "Clareza visual, organização das informações, estética, ortografia e síntese no pôster apresentado.",
    "Segurança, clareza, uso de linguagem técnica adequada e domínio sobre o tema durante a apresentação e respostas às perguntas.",
    "Divisão de tarefas, cooperação entre os integrantes, postura e responsabilidade demonstradas.",
    "Inserção de princípios de sustentabilidade, aproveitamento de resíduos, economia de recursos e boas práticas ambientais.",
    "Clareza na redação científica, coerência, estrutura e normalização do texto (caso aplicável)."
]

def generate_unique_pin(db: Session) -> str:
    while True:
        pin = str(random.randint(1000, 9999))
        existing = db.query(Evaluator).filter(Evaluator.PIN == pin).first()
        if not existing:
            return pin

def find_or_create_user(db: Session, name: str) -> User:
    user = db.query(User).filter(
        User.name.ilike(f"%{name}%"),
        User.deleted_at == None
    ).first()
    
    if user:
        return user
    
    email_base = name.lower().replace(" ", ".").replace("/", ".")
    email = f"{email_base}@ifsp.edu.br"
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        return existing_user
    
    new_user = User(
        name=name,
        email=email,
        password=User.get_password_hash("123456"),
        active=True,
        email_verified_at=datetime.now()
    )
    db.add(new_user)
    db.flush()
    return new_user

def find_or_create_evaluator(db: Session, evaluator_name: str) -> Evaluator:
    evaluator_name = evaluator_name.strip()
    
    if not evaluator_name:
        return None
    
    if "/" in evaluator_name:
        evaluator_name = evaluator_name.split("/")[0].strip()
    
    user = find_or_create_user(db, evaluator_name)
    
    existing_evaluator = db.query(Evaluator).filter(
        Evaluator.user_id == user.id,
        Evaluator.deleted_at == None,
        Evaluator.year == datetime.now().year
    ).first()
    
    if existing_evaluator:
        return existing_evaluator
    
    unique_pin = generate_unique_pin(db)
    new_evaluator = Evaluator(
        user_id=user.id,
        PIN=unique_pin,
        year=datetime.now().year
    )
    db.add(new_evaluator)
    db.flush()
    return new_evaluator

def get_or_create_default_category(db: Session) -> Category:
    category = db.query(Category).filter(
        Category.name.ilike("%CAE%"),
        Category.deleted_at == None
    ).first()
    
    if category:
        return category
    
    category = db.query(Category).filter(
        Category.deleted_at == None
    ).first()
    
    if not category:
        category = Category(
            name="CAE - Ciências Agrárias e Engenharias"
        )
        db.add(category)
        db.commit()
        db.refresh(category)
    
    return category

def get_or_create_default_school(db: Session) -> School:
    school = db.query(School).filter(
        School.name == "IFSP - Campus Presidente Prudente",
        School.deleted_at == None
    ).first()
    
    if not school:
        school = School(
            name="IFSP - Campus Presidente Prudente"
        )
        db.add(school)
        db.commit()
        db.refresh(school)
    
    return school

def create_questions(db: Session):
    print("\n=== CRIANDO QUESTÕES SAIPRU ===")
    
    current_year = datetime.now().year
    
    for idx, question_text in enumerate(QUESTIONS, 1):
        existing = db.query(Question).filter(
            Question.scientific_text == question_text,
            Question.technological_text == question_text,
            Question.year == current_year,
            Question.deleted_at == None
        ).first()
        
        if existing:
            print(f"  ⏭️  Questão {idx} já existe (ID: {existing.id})")
            continue
        
        new_question = Question(
            scientific_text=question_text,
            technological_text=question_text,
            type=QuestionType.MULTIPLE_CHOICE.value,
            number_alternatives=10,
            year=current_year
        )
        db.add(new_question)
        db.commit()
        db.refresh(new_question)
        print(f"  ✅ Questão {idx} criada (ID: {new_question.id})")
    
    print("✅ Questões criadas com sucesso!\n")

def parse_csv(csv_path: str):
    projects_data = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            project_title = row.get('Projetos', '').strip()
            authors_str = row.get('autores', '').strip()
            evaluator1 = row.get('Avaliador 1', '').strip()
            evaluator2 = row.get('Avaliador 2', '').strip()
            evaluator3 = row.get('Avaliador 3', '').strip()
            
            if not project_title:
                continue
            
            authors = [a.strip() for a in authors_str.split(',') if a.strip()]
            
            evaluators = []
            for ev in [evaluator1, evaluator2, evaluator3]:
                if ev:
                    if "/" in ev:
                        for name in ev.split("/"):
                            name = name.strip()
                            if name:
                                evaluators.append(name)
                    else:
                        evaluators.append(ev)
            
            projects_data.append({
                'title': project_title,
                'authors': authors,
                'evaluators': evaluators
            })
    
    return projects_data

def import_projects_and_evaluators(db: Session, projects_data: list):
    print("\n=== IMPORTANDO PROJETOS E AVALIADORES ===\n")
    
    category = get_or_create_default_category(db)
    school = get_or_create_default_school(db)
    
    current_year = datetime.now().year
    created_projects = 0
    created_students = 0
    created_assessments = 0
    
    for idx, project_data in enumerate(projects_data, 1):
        print(f"Processando projeto {idx}: {project_data['title'][:50]}...")
        
        try:
            new_project = Project(
                title=project_data['title'],
                description="",
                year=current_year,
                category_id=category.id,
                projectType=1,
            )
            db.add(new_project)
            db.commit()
            db.refresh(new_project)
            created_projects += 1
            print(f"  ✅ Projeto criado (ID: {new_project.id})")
            
            for author_name in project_data['authors']:
                if not author_name:
                    continue
                
                existing_student = db.query(Student).filter(
                    Student.name.ilike(f"%{author_name}%"),
                    Student.year == current_year,
                    Student.deleted_at == None
                ).first()
                
                if existing_student:
                    student = existing_student
                else:
                    student = Student(
                        name=author_name,
                        email=None,
                        year=current_year,
                        school_grade=2,
                        school_id=school.id,
                    )
                    db.add(student)
                    db.commit()
                    db.refresh(student)
                    created_students += 1
                
                if student not in new_project.students:
                    new_project.students.append(student)
            
            db.commit()
            print(f"  ✅ {len(project_data['authors'])} estudante(s) associado(s)")
            
            for evaluator_name in project_data['evaluators']:
                if not evaluator_name:
                    continue
                
                evaluator = find_or_create_evaluator(db, evaluator_name)
                if not evaluator:
                    print(f"  ⚠️  Não foi possível criar avaliador: {evaluator_name}")
                    continue
                
                existing_assessment = db.query(Assessment).filter(
                    Assessment.evaluator_id == evaluator.id,
                    Assessment.project_id == new_project.id,
                    Assessment.deleted_at == None
                ).first()
                
                if existing_assessment:
                    print(f"  ℹ️  Assessment já existe para avaliador {evaluator_name}")
                    continue
                
                new_assessment = Assessment(
                    evaluator_id=evaluator.id,
                    project_id=new_project.id
                )
                db.add(new_assessment)
                db.commit()
                created_assessments += 1
                print(f"  ✅ Assessment criado para avaliador {evaluator_name} (PIN: {evaluator.PIN})")
            
        except Exception as e:
            db.rollback()
            print(f"  ❌ Erro ao processar projeto {idx}: {str(e)}")
            continue
    
    print(f"\n=== RESULTADO DA IMPORTAÇÃO ===")
    print(f"Projetos criados: {created_projects}")
    print(f"Estudantes criados: {created_students}")
    print(f"Assessments criados: {created_assessments}")

if __name__ == "__main__":
    csv_path = os.path.join(os.path.dirname(__file__), "saipru.csv")
    
    if not os.path.exists(csv_path):
        print(f"❌ Erro: Arquivo não encontrado em {csv_path}")
        sys.exit(1)
    
    db = SessionLocal()
    
    try:
        school = get_or_create_default_school(db)
        print(f"✅ Escola criada/encontrada: {school.name}\n")
        
        create_questions(db)
        
        print("=== LENDO ARQUIVO CSV ===\n")
        projects_data = parse_csv(csv_path)
        print(f"Total de projetos encontrados: {len(projects_data)}\n")
        
        import_projects_and_evaluators(db, projects_data)
        
        print("\n✅ Importação concluída com sucesso!")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro durante a importação: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

