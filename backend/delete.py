#!/usr/bin/env python3
"""
Script para deletar todos os registros das tabelas responses e assessments
"""

import sys
import os
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from app.database import engine, Base
from app.models.response import Response
from app.models.assessment import Assessment

def delete_all_records():
    """Deleta todos os registros das tabelas responses e assessments"""
    
    # Criar uma sessão
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("Iniciando processo de deleção...")
        
        # Deletar todos os registros da tabela responses
        print("Deletando registros da tabela 'responses'...")
        deleted_responses = db.query(Response).delete()
        print(f"✓ {deleted_responses} registros deletados da tabela 'responses'")
        
        # Deletar todos os registros da tabela assessments
        print("Deletando registros da tabela 'assessments'...")
        deleted_assessments = db.query(Assessment).delete()
        print(f"✓ {deleted_assessments} registros deletados da tabela 'assessments'")
        
        # Confirmar as transações
        db.commit()
        print("\n✅ Todas as deleções foram concluídas com sucesso!")
        print(f"Total de registros deletados: {deleted_responses + deleted_assessments}")
        
    except Exception as e:
        print(f"❌ Erro durante a deleção: {e}")
        db.rollback()
        sys.exit(1)
        
    finally:
        db.close()

def confirm_deletion():
    """Solicita confirmação do usuário antes de deletar"""
    print("⚠️  ATENÇÃO: Este script irá deletar TODOS os registros das tabelas 'responses' e 'assessments'")
    print("Esta ação NÃO pode ser desfeita!")
    print()
    
    response = input("Tem certeza que deseja continuar? Digite 'SIM' para confirmar: ")
    
    if response.upper() != 'SIM':
        print("Operação cancelada.")
        sys.exit(0)
    
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("SCRIPT DE DELEÇÃO - RESPONSES E ASSESSMENTS")
    print("=" * 60)
    print()
    
    # Executar deleção
    delete_all_records()
    
    print("\n" + "=" * 60)
    print("Script finalizado.")
    print("=" * 60)
