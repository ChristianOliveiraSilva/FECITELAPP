from sqlalchemy.orm import Session
from app.models.user import User
from app.models.evaluator import Evaluator
from app.models.school import School
from app.models.student import Student
from app.models.category import Category
from app.models.project import Project
from app.models.assessment import Assessment
from app.models.question import Question
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
        for i in range(20):
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
        pin = 1111
        for user in users:
            evaluator = Evaluator(
                PIN=pin,
                user_id=user.id,
                year=current_year
            )
            pin += 1
            self.db.add(evaluator)
            evaluators.append(evaluator)
        
        self.db.commit()
        print(f"👨‍💼 Criados {len(evaluators)} avaliadores")
        
        schools = self.db.query(School).all()
        students = []

        nomes_brasileiros = [
            "Aluno 1",
            "Aluno 2",
            "Aluno 3",
            "Aluno 4",
            "Aluno 5"
        ]

        for i in range(5):
            school = schools[i % len(schools)] if schools else None
            student = Student(
                name=nomes_brasileiros[i],
                email=fake.unique.email(),
                school_id=school.id if school else None,
                school_grade=random.choice([SchoolGrade.FUNDAMENTAL, SchoolGrade.MEDIO]).value,
                year=current_year
            )
            self.db.add(student)
            students.append(student)

        self.db.commit()
        print(f"👨‍🎓 Criados {len(students)} estudantes")
        
        # Pega só as 5 categorias principais (usando == None)
        categories = self.db.query(Category).filter(Category.main_category_id == None).limit(5).all()
        projects = []
        possible_titles = [
            "Teste 1",
            "Teste 2",
            "Teste 3",
            "Teste 4",
            "Teste 5"
        ]
        
        for category in categories:
            for i in range(2):
                project_type = random.choice(list(ProjectType))
                title = random.choice(possible_titles)
                
                project = Project(
                    title=title,
                    description="Teste " + str(random.randint(1000, 9999)),
                    year=current_year,
                    projectType=project_type.value,
                    category_id=category.id,
                    external_id=random.randint(1000, 9999),
                    file="/uploads/projects/teste.docx"
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
        
        # Criar perguntas fake
        existing_questions = self.db.query(Question).count()
        if existing_questions == 0:
            questions_data = [
                {
                    'id': 6,
                    'scientific_text': 'Teste?',
                    'technological_text': 'Teste?',
                    'type': 1,
                    'number_alternatives': 10,
                    'year': current_year,
                    'created_at': datetime(2024, 10, 2, 13, 24, 44),
                    'updated_at': datetime(2024, 10, 2, 13, 24, 44),
                    'deleted_at': None,
                },
                {
                    'id': 7,
                    'scientific_text': 'Os objetivos do projeto estão claros?',
                    'technological_text': 'Os objetivos do projeto estão claros?',
                    'type': 1,
                    'number_alternatives': 10,
                    'year': current_year,
                    'created_at': datetime(2024, 10, 2, 13, 25, 22),
                    'updated_at': datetime(2024, 10, 2, 13, 25, 22),
                    'deleted_at': None,
                },
                {
                    'id': 8,
                    'scientific_text': 'A metodologia está adequada?',
                    'technological_text': 'A metodologia está adequada?',
                    'type': 1,
                    'number_alternatives': 10,
                    'year': current_year,
                    'created_at': datetime(2024, 10, 2, 13, 25, 54),
                    'updated_at': datetime(2024, 10, 2, 13, 25, 54),
                    'deleted_at': None,
                },
                {
                    'id': 9,
                    'scientific_text': 'O projeto apresenta relevância?',
                    'technological_text': 'O projeto apresenta relevância?',
                    'type': 1,
                    'number_alternatives': 10,
                    'year': current_year,
                    'created_at': datetime(2024, 10, 2, 13, 26, 11),
                    'updated_at': datetime(2024, 10, 2, 13, 26, 11),
                    'deleted_at': None,
                },
            ]
            
            for question_data in questions_data:
                question = Question(**question_data)
                self.db.add(question)
                print(f"❓ Criada questão ID {question_data['id']}")
            
            self.db.commit()
            print("✅ Questões fake criadas")
        
        print("✅ Seeder de testes concluído!")
