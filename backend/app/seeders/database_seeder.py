from sqlalchemy.orm import Session
from app.models import User, PasswordReset
from app.seeders.school_seeder import SchoolSeeder
from app.seeders.category_seeder import CategorySeeder
from app.seeders.question_seeder import QuestionSeeder
from app.seeders.test_seeder import TestSeeder
import os

class DatabaseSeeder:
    def __init__(self, db: Session):
        self.db = db
    
    def run(self):
        """Executa todos os seeders na ordem correta"""
        print("🌱 Iniciando seeders...")
        
        # Executar seeders na ordem
        SchoolSeeder(self.db).run()
        CategorySeeder(self.db).run()
        QuestionSeeder(self.db).run()
        TestSeeder(self.db).run()
        
        # Criar usuários padrão
        self._create_default_users()
        
        print("✅ Seeders concluídos com sucesso!")
    
    def _create_default_users(self):
        """Cria usuários padrão do sistema"""
        # Verificar se já existem usuários
        existing_users = self.db.query(User).count()
        if existing_users > 0:
            print("ℹ️  Usuários já existem, pulando criação de usuários padrão")
            return
        
        # Criar usuários padrão
        default_users = [
            {
                'name': 'Rogério Alves dos Santos Antoniassi',
                'email': 'rogerio.antoniassi@ifms.edu.br',
                'password': 'password' if os.getenv('APP_ENV') != 'production' else 'R8$hG7@fK4jLp9#Qw1ZuV2',
                'active': True
            },
            {
                'name': 'Alex Fernando de Araujo',
                'email': 'alex.araujo@ifms.edu.br',
                'password': 'password' if os.getenv('APP_ENV') != 'production' else 'm5^Tz8*QrW3&yJ0@bC6xL7',
                'active': True
            }
        ]
        
        # Criar usuário de teste apenas em ambiente de desenvolvimento
        if os.getenv('APP_ENV') != 'production':
            default_users.append({
                'name': 'Test User',
                'email': 'test@ifms.edu.br',
                'password': 'password',
                'active': True
            })
        
        for user_data in default_users:
            # Verificar se o usuário já existe
            existing_user = self.db.query(User).filter(User.email == user_data['email']).first()
            if not existing_user:
                hashed_password = User.get_password_hash(user_data['password'])
                user = User(
                    name=user_data['name'],
                    email=user_data['email'],
                    password=hashed_password,
                    active=user_data['active']
                )
                self.db.add(user)
                print(f"👤 Criado usuário: {user_data['name']}")
        
        self.db.commit()
        print("✅ Usuários padrão criados com sucesso!") 