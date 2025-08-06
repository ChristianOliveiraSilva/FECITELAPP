from sqlalchemy.orm import Session
from app.models import Event
from datetime import datetime

class EventSeeder:
    def __init__(self, db: Session):
        self.db = db
    
    def run(self):
        """Executa o seeder de eventos"""
        print("📅 Iniciando seeder de eventos...")
        
        existing_events = self.db.query(Event).count()
        if existing_events > 0:
            print("ℹ️  Eventos já existem, pulando criação")
            return
        
        current_year = datetime.now().year
        start_year = 2024
        
        for year in range(start_year, current_year + 1):
            event_data = {
                'year': year,
                'app_primary_color': '#56BA54',
                'app_logo_url': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Instituto_Federal_de_Mato_Grosso_do_Sul_-_Marca_Vertical_2015.svg/250px-Instituto_Federal_de_Mato_Grosso_do_Sul_-_Marca_Vertical_2015.svg.png',
            }
            
            event = Event(**event_data)
            self.db.add(event)
            print(f"📅 Criado evento: FECITEL {year}")
        
        self.db.commit()
        print("✅ Seeder de eventos concluído!")