from sqlalchemy.orm import Session
from app.models.user import User
from app.models.evaluator import Evaluator
from app.models.school import School
from app.models.student import Student
from app.models.category import Category
from app.models.project import Project
from app.models.assessment import Assessment
from app.enums.project_type import ProjectType
from app.enums.school_grade import SchoolGrade
import random
import string
from faker import Faker
from datetime import datetime

fake = Faker('pt_BR')

class TestSeeder:
    def __init__(self, db: Session):
        self.db = db
    
    def run(self):
        print("🧪 Iniciando seeder de testes...")
        
        existing_evaluators = self.db.query(Evaluator).count()
        if existing_evaluators > 0:
            print("ℹ️  Dados de teste já existem, pulando criação")
            return
        
        current_year = datetime.now().year
        
        users = []
        for i in range(5):
            user = User(
                name=fake.name(),
                email=fake.unique.email(),
                password=User.get_password_hash('password'),
                active=True
            )
            self.db.add(user)
            users.append(user)
        
        self.db.commit()
        print(f"👤 Criados {len(users)} usuários para avaliadores")
        
        evaluators = []
        for user in users:
            evaluator = Evaluator(
                PIN=random.randint(1000, 9999),
                user_id=user.id,
                year=current_year
            )
            self.db.add(evaluator)
            evaluators.append(evaluator)
        
        self.db.commit()
        print(f"👨‍💼 Criados {len(evaluators)} avaliadores")
        
        schools = self.db.query(School).all()
        students = []
        
        for school in schools:
            for i in range(3):
                student = Student(
                    name=fake.name(),
                    email=fake.unique.email(),
                    school_id=school.id,
                    school_grade=random.choice([SchoolGrade.FUNDAMENTAL, SchoolGrade.MEDIO]).value,
                    year=current_year
                )
                self.db.add(student)
                students.append(student)
        
        self.db.commit()
        print(f"👨‍🎓 Criados {len(students)} estudantes")
        
        categories = self.db.query(Category).all()
        projects = []
        
        for category in categories:
            for i in range(2):
                project_type = random.choice(list(ProjectType))
                
                project = Project(
                    title=fake.sentence(nb_words=3),
                    description=fake.paragraph(),
                    year=current_year,
                    projectType=project_type.value,
                    category_id=category.id,
                    external_id=random.randint(1000, 9999),
                    file="teste.docx"
                )
                self.db.add(project)
                projects.append(project)
        
        self.db.commit()
        print(f"📋 Criados {len(projects)} projetos")
        
        for project in projects:
            project_students = random.sample(students, random.randint(1, min(3, len(students))))
            for student in project_students:
                project.students.append(student)
        
        self.db.commit()
        print("✅ Estudantes associados aos projetos")
        
        evaluator_project_count = {}
        
        for project in projects:
            available_evaluators = [
                eval for eval in evaluators 
                if evaluator_project_count.get(eval.id, 0) < 3
            ]
            
            if not available_evaluators:
                break
            
            project_evaluators = random.sample(
                available_evaluators, 
                random.randint(1, min(3, len(available_evaluators))))
            
            for evaluator in project_evaluators:
                assessment = Assessment(
                    evaluator_id=evaluator.id,
                    project_id=project.id,
                )
                print('assessment criado!')
                self.db.add(assessment)
                
                evaluator_project_count[evaluator.id] = evaluator_project_count.get(evaluator.id, 0) + 1
        
        self.db.commit()
        print("✅ Avaliações criadas")
        
        main_categories = self.db.query(Category).filter(Category.main_category_id.is_(None)).limit(5).all()
        
        for evaluator in evaluators:
            random_category = random.choice(main_categories)
            evaluator.categories.append(random_category)
        
        self.db.commit()
        print("✅ Categorias associadas aos avaliadores")
        
        print("✅ Seeder de testes concluído!")
