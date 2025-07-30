#!/usr/bin/env python3
"""
Script para executar os seeders do FastAPI
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app.models import Base
from app.seeders.database_seeder import DatabaseSeeder

def main():
    """Função principal para executar os seeders"""
    print("🚀 Iniciando execução dos seeders...")
    
    # Criar tabelas se não existirem
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas/verificadas")
    
    # Criar sessão do banco
    db = SessionLocal()
    
    try:
        # Executar seeder principal
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