from sqlalchemy.orm import Session
from app.models import School

class SchoolSeeder:
    def __init__(self, db: Session):
        self.db = db
    
    def run(self):
        """Executa o seeder de escolas"""
        print("🏫 Iniciando seeder de escolas...")
        
        existing_schools = self.db.query(School).count()
        if existing_schools > 0:
            print("ℹ️  Escolas já existem, pulando criação")
            return
        
        schools_data = [
            {
                'name': 'Instituto Federal de Mato Grosso do Sul',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Escola Estadual Afonso Pena',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Escola Estadual João Magiano Pinto (JOMAP)',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Escola Estadual Luiz Lopes de Carvalho',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Escola Estadual Fernando Corrêa da Costa',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Escola Municipal Parque São Carlos',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Escola Municipal Elma Garcia Lata Batista',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Colégio SESI Três Lagoas',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Colégio Anglo Três Lagoas',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Colégio Objetivo Três Lagoas',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
            {
                'name': 'Colégio Dom Bosco',
                'city': 'Três Lagoas',
                'state': 'MS',
            },
        ]
        
        for school_data in schools_data:
            school = School(**school_data)
            self.db.add(school)
            print(f"🏫 Criada escola: {school_data['name']}")
        
        self.db.commit()
        print("✅ Seeder de escolas concluído!") 