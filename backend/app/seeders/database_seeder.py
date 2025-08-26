from sqlalchemy.orm import Session
from app.models import User
from app.seeders.school_seeder import SchoolSeeder
from app.seeders.category_seeder import CategorySeeder
from app.seeders.test_seeder import TestSeeder
from app.seeders.event_seeder import EventSeeder
from app.seeders.password_reset_config_seeder import PasswordResetConfigSeeder
import os

class DatabaseSeeder:
    def __init__(self, db: Session):
        self.db = db
    
    def run(self):
        print("🌱 Iniciando seeders...")
        
        SchoolSeeder(self.db).run()
        CategorySeeder(self.db).run()
        EventSeeder(self.db).run()
        PasswordResetConfigSeeder(self.db).run()
        if os.getenv('APP_ENV') != 'production':
            TestSeeder(self.db).run()
        
        self._create_default_users()
        print("✅ Seeders concluídos com sucesso!")
    
    def _create_default_users(self):
        default_users = [
            {
                'name': 'Rogério Alves dos Santos Antoniassi',
                'email': 'rogerio.antoniassi@ifms.edu.br',
                'password': 'password' if os.getenv('APP_ENV') != 'production' else 'R8$hG7@fK4jLp9#Qw1ZuV2',
            },
            {
                'name': 'Alex Fernando de Araujo',
                'email': 'alex.araujo@ifms.edu.br',
                'password': 'password' if os.getenv('APP_ENV') != 'production' else 'm5^Tz8*QrW3&yJ0@bC6xL7',
            }
        ]
        
        if os.getenv('APP_ENV') != 'production':
            default_users.append({
                'name': 'Test User',
                'email': 'test@ifms.edu.br',
                'password': 'password',
            })
        
        for user_data in default_users:
            existing_user = self.db.query(User).filter(User.email == user_data['email']).first()
            if not existing_user:
                hashed_password = User.get_password_hash(user_data['password'])
                user = User(
                    name=user_data['name'],
                    email=user_data['email'],
                    password=hashed_password,
                    active=True
                )
                self.db.add(user)
                print(f"👤 Criado usuário: {user_data['name']}")
        
        self.db.commit()
        print("✅ Usuários padrão criados com sucesso!") 