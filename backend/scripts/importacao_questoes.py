
from app.models.question import Question
from app.enums.question_type import QuestionType
from app.database import SessionLocal
from datetime import datetime
import pandas as pd
import sys

def clean_string(value):
    if pd.isna(value) or value == "":
        return ""
    return str(value).strip()

if __name__ == "__main__":
    excel_file_path = "./questões.xlsx"
    
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
        
        # Contar registros antes da importação
        question_count_before = db.query(Question).count()
        print(f"\nTotal de questões ANTES: {question_count_before}")

        print("\n=== PROCESSANDO QUESTÕES ===\n")
        
        for idx, row in df.iterrows():
            # Pular linha de cabeçalho se necessário
            if idx == 0:
                continue
                
            print(f"Processando linha {idx + 1}...")
            
            # Extrair dados das colunas
            cientifico = clean_string(row.get('Científico', ''))
            tecnologico = clean_string(row.get('Tecnológico', ''))
            peso = clean_string(row.get('Peso', ''))
            
            # Validar se pelo menos um dos textos existe
            if not cientifico and not tecnologico:
                print(f"  ❌ Pula linha {idx + 1}: Nenhum texto (Científico ou Tecnológico) encontrado")
                continue
            
            # Converter peso para número (number_alternatives)
            try:
                number_alternatives = int(peso) if peso and peso.isdigit() else None
            except (ValueError, TypeError):
                number_alternatives = None
                print(f"    ⚠️  Peso inválido '{peso}', definindo como None")
            
            try:
                # Criar questão
                new_question = Question(
                    scientific_text=cientifico if cientifico else None,
                    technological_text=tecnologico if tecnologico else None,
                    type=QuestionType.MULTIPLE_CHOICE.value,  # Sempre múltipla escolha
                    number_alternatives=number_alternatives,
                    year=datetime.now().year
                )
                db.add(new_question)
                db.commit()
                
                print(f"  ✅ Criada questão ID {new_question.id}:")
                if cientifico:
                    print(f"    Científico: {cientifico[:50]}{'...' if len(cientifico) > 50 else ''}")
                if tecnologico:
                    print(f"    Tecnológico: {tecnologico[:50]}{'...' if len(tecnologico) > 50 else ''}")
                if number_alternatives:
                    print(f"    Peso/Alternativas: {number_alternatives}")
                
            except Exception as e:
                db.rollback()
                print(f"  ❌ Erro ao criar questão na linha {idx + 1}: {str(e)}")
                continue

        # Contar registros depois da importação
        question_count_after = db.query(Question).count()
        
        print(f"\n=== RESULTADO DA IMPORTAÇÃO ===")
        print(f"Total de questões DEPOIS: {question_count_after} (+{question_count_after - question_count_before})")
        
        db.close()
        
    except FileNotFoundError:
        print(f"Erro: Arquivo não encontrado em {excel_file_path}")
        print("Certifique-se de que o arquivo 'questões.xlsx' está na pasta backend/")
        sys.exit(1)
    except Exception as e:
        print(f"Erro ao ler o arquivo: {str(e)}")
        sys.exit(1)