from app.models.user import User
from app.models.evaluator import Evaluator
from app.models.category import Category
from app.models.relationships import evaluator_categories
from app.database import SessionLocal
from sqlalchemy import or_, not_, exists, and_, func, distinct
from datetime import datetime
from pprint import pprint
import pandas as pd
import os
import random
import string
import sys


def generate_unique_pin(db):
    """Gera um PIN único de 4 dígitos para o avaliador"""
    while True:
        pin = str(random.randint(1000, 9999))
        existing = db.query(Evaluator).filter(Evaluator.PIN == pin).first()
        if not existing:
            return pin

def clean_string(value):
    """Limpa e converte valores para string"""
    if pd.isna(value) or value == "":
        return ""
    return str(value).strip()

def find_categories_by_text(area_text, db):
    """Busca categorias principais no banco baseado no texto da área de formação"""
    if not area_text or area_text == "":
        return []
    
    # Mapeamento direto dos nomes do Excel para as categorias principais do seeder
    excel_to_category = {
        "ciências exatas e da terra (cet)": "CET - Ciências Exatas e da Terra",
        "ciências humanas, sociais aplicadas e linguagens (chsal)": "CHSAL - Ciências Humanas; Sociais Aplicadas e Linguística e Artes",
        "ciências biológicas e saúde (cbs)": "CBS - Ciências Biológicas e da Saúde", 
        "ciências agrárias e engenharias (cae)": "CAE - Ciências Agrárias e Engenharias",
        "multidisciplinar (mdis)": "MDIS - Multidisciplinar"
    }
    
    area_text_lower = area_text.lower().strip()
    
    # 1. Primeiro, tentar encontrar categoria principal
    for excel_name, category_name in excel_to_category.items():
        if excel_name in area_text_lower:
            # Buscar a categoria no banco
            category = db.query(Category).filter(
                Category.name == category_name,
                Category.deleted_at == None
            ).first()
            if category:
                return [category]
    
    # 2. Se não encontrou categoria principal, buscar nas subcategorias
    # Buscar todas as subcategorias (que têm main_category_id != None)
    subcategories = db.query(Category).filter(
        Category.main_category_id != None,
        Category.deleted_at == None
    ).all()
    
    for subcategory in subcategories:
        subcategory_name_lower = subcategory.name.lower()
        
        # Verificar se o texto da área contém o nome da subcategoria
        if subcategory_name_lower in area_text_lower:
            # Encontrar a categoria pai
            parent_category = db.query(Category).filter(
                Category.id == subcategory.main_category_id,
                Category.deleted_at == None
            ).first()
            
            if parent_category:
                print(f"    🔍 Encontrada subcategoria '{subcategory.name}' → categoria pai: '{parent_category.name}'")
                return [parent_category]
    
    # 3. Se ainda não encontrou, retornar lista vazia
    return []

def parse_subareas(subarea_texts):
    """Extrai subáreas dos textos fornecidos"""
    if not subarea_texts:
        return []
    
    subareas = []
    for text in subarea_texts:
        if text and text.strip():
            parts = text.replace(';', ',').replace('\n', ',').split(',')
            for part in parts:
                part = part.strip()
                if part:
                    subareas.append(part)
    
    return list(set(subareas))  # Remove duplicatas

if __name__ == "__main__":
    excel_file_path = "./avaliadores.xlsx"
    
    try:
        df = pd.read_excel(excel_file_path)
        df = df.fillna("")

        print("=== PRIMEIRAS LINHAS DO ARQUIVO EXCEL ===")
        print(f"Nome do arquivo: {excel_file_path}")
        print(f"Total de linhas: {len(df)}")
        print(f"Total de colunas: {len(df.columns)}")
        print("\nNomes das colunas:")
        for i, col in enumerate(df.columns):
            print(f"{i+1}. {col}")

        db = SessionLocal()
        
        # Mostrar categorias disponíveis no banco
        print("\n=== CATEGORIAS DISPONÍVEIS NO BANCO ===")
        categories = db.query(Category).filter(Category.deleted_at == None).all()
        if categories:
            for i, category in enumerate(categories, 1):
                print(f"{i}. {category.name}")
        else:
            print("⚠️  Nenhuma categoria encontrada no banco de dados!")
            print("Execute o seeder de categorias antes de importar os avaliadores.")
            db.close()
            sys.exit(1)
        
        # Contar registros antes da importação
        user_count_before = db.query(User).count()
        evaluator_count_before = db.query(Evaluator).count()
        print(f"\nTotal de usuários ANTES: {user_count_before}")
        print(f"Total de avaliadores ANTES: {evaluator_count_before}")

        print("\n=== PROCESSANDO AVALIADORES ===\n")
        
        for idx, row in df.iterrows():
            # Pular linha de cabeçalho se necessário
            if idx == 0:
                continue
                
            print(f"Processando linha {idx + 1}...")
            
            # Extrair dados das colunas
            timestamp = clean_string(row.get('Carimbo de data/hora', ''))
            email = clean_string(row.get('Endereço de e-mail', ''))
            nome_completo = clean_string(row.get('Nome completo', ''))
            telefone = clean_string(row.get('Telefone (WhatsApp)', ''))
            instituicao = clean_string(row.get('Instituição/Empresa de vínculo', ''))
            area_formacao = clean_string(row.get('Marque a área em que possui formação ou experiência:', ''))
            
            subareas = []
            for i in range(1, 5):  # Colunas 7-10 são as subáreas
                subarea_col = f'Quais subáreas você gostaria de avaliar?'
                if i > 1:
                    subarea_col += f'.{i-1}'
                subarea_text = clean_string(row.get(subarea_col, ''))
                if subarea_text:
                    subareas.append(subarea_text)
            
            # Validar campos obrigatórios
            if not email or not nome_completo:
                print(f"  ❌ Pula linha {idx + 1}: Email ou nome em branco")
                continue
                
            # Verificar se usuário já existe
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                print(f"  🔄 Usuário com email {email} já existe - verificando avaliador...")
                
                # Buscar o avaliador existente
                existing_evaluator = db.query(Evaluator).filter(
                    Evaluator.user_id == existing_user.id,
                    Evaluator.deleted_at == None
                ).first()
                
                if not existing_evaluator:
                    print(f"    ❌ Usuário existe mas não tem avaliador associado")
                    continue
                
                # Buscar categorias baseadas na área de formação
                found_categories = find_categories_by_text(area_formacao, db)
                
                # Buscar categorias baseadas nas subáreas também
                subareas_list = parse_subareas(subareas)
                for subarea in subareas_list:
                    subarea_categories = find_categories_by_text(subarea, db)
                    found_categories.extend(subarea_categories)
                
                # Remover duplicatas
                found_categories = list(set(found_categories))
                
                if not found_categories:
                    print(f"    ⚠️  Nenhuma categoria encontrada para: {area_formacao}")
                    if subareas_list:
                        print(f"    Subáreas processadas: {', '.join(subareas_list)}")
                    continue
                
                # Verificar quais categorias já estão associadas
                existing_category_ids = [cat.id for cat in existing_evaluator.categories]
                new_categories = [cat for cat in found_categories if cat.id not in existing_category_ids]
                
                if not new_categories:
                    print(f"    ℹ️  Todas as categorias já estão associadas: {', '.join([cat.name for cat in found_categories])}")
                    continue
                
                # Adicionar apenas as novas categorias
                for category in new_categories:
                    existing_evaluator.categories.append(category)
                
                db.commit()
                
                print(f"    ✅ Adicionadas novas categorias ao avaliador PIN {existing_evaluator.PIN}:")
                for category in new_categories:
                    print(f"      + {category.name}")
                
                continue
            
            try:
                # Criar usuário
                new_user = User(
                    name=nome_completo,
                    email=email,
                    password=User.get_password_hash("123456"),
                    active=True,
                    email_verified_at=datetime.now()
                )
                db.add(new_user)
                db.flush()
                
                # Gerar PIN único
                unique_pin = generate_unique_pin(db)
                
                # Criar avaliador
                new_evaluator = Evaluator(
                    user_id=new_user.id,
                    PIN=unique_pin,
                    year=datetime.now().year
                )
                db.add(new_evaluator)
                db.flush()
                
                # Buscar categorias baseadas na área de formação
                found_categories = find_categories_by_text(area_formacao, db)
                
                # Buscar categorias baseadas nas subáreas também
                subareas_list = parse_subareas(subareas)
                for subarea in subareas_list:
                    subarea_categories = find_categories_by_text(subarea, db)
                    found_categories.extend(subarea_categories)
                
                # Remover duplicatas
                found_categories = list(set(found_categories))
                
                if found_categories:
                    # Associar categorias ao avaliador
                    for category in found_categories:
                        new_evaluator.categories.append(category)
                    
                    db.commit()
                    print(f"  ✅ Criado: {nome_completo} ({email}) - PIN: {unique_pin}")
                    print(f"    Categorias associadas: {', '.join([cat.name for cat in found_categories])}")
                else:
                    db.commit()
                    print(f"  ✅ Criado: {nome_completo} ({email}) - PIN: {unique_pin}")
                    print(f"    ⚠️  Nenhuma categoria encontrada para: {area_formacao}")
                    if subareas_list:
                        print(f"    Subáreas processadas: {', '.join(subareas_list)}")
                
            except Exception as e:
                db.rollback()
                print(f"  ❌ Erro ao criar avaliador na linha {idx + 1}: {str(e)}")
                continue

        # Contar registros depois da importação
        user_count_after = db.query(User).count()
        evaluator_count_after = db.query(Evaluator).count()
        
        print(f"\n=== RESULTADO DA IMPORTAÇÃO ===")
        print(f"Total de usuários DEPOIS: {user_count_after} (+{user_count_after - user_count_before})")
        print(f"Total de avaliadores DEPOIS: {evaluator_count_after} (+{evaluator_count_after - evaluator_count_before})")
        
        db.close()
        
    except FileNotFoundError:
        print(f"Erro: Arquivo não encontrado em {excel_file_path}")
        print("Certifique-se de que o arquivo 'avaliadores.xlsx' está na pasta backend/")
    except Exception as e:
        print(f"Erro ao ler o arquivo: {str(e)}")