import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base
from app.seeders.database_seeder import DatabaseSeeder

def main():
    print("🚀 Iniciando execução dos seeders...")
    
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas/verificadas")
    
    db = SessionLocal()
    
    try:
        seeder = DatabaseSeeder(db)
        seeder.run()
        print("🎉 Seeders executados com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao executar seeders: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main() 