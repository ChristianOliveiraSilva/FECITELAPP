from sqlalchemy.orm import Session
from app.models.question import Question
from datetime import datetime

class QuestionSeeder:
    def __init__(self, db: Session):
        self.db = db
    
    def run(self):
        """Executa o seeder de questões"""
        print("❓ Iniciando seeder de questões...")
        
        existing_questions = self.db.query(Question).count()
        if existing_questions > 0:
            print("ℹ️  Questões já existem, pulando criação")
            return
        
        current_year = datetime.now().year
        
        questions_data = [
            {
                'id': 6,
                'scientific_text': 'Problema/hipótese: delimitação do tema, relação hipótese/problema/objetivo; clareza na formulação; originalidade; relevância social.',
                'technological_text': 'Problema/hipótese: delimitação do tema, relação hipótese/problema/objetivo; clareza na formulação; originalidade; relevância social.',
                'type': 1,
                'number_alternatives': 10,
                'year': current_year,
                'created_at': datetime(2024, 10, 2, 13, 24, 44),
                'updated_at': datetime(2024, 10, 2, 13, 24, 44),
                'deleted_at': None,
            },
            {
                'id': 7,
                'scientific_text': 'Problema: definição clara do problema; alternativas de solução relacionando com teorias e conceitos científicos; originalidade; relevância social.',
                'technological_text': 'Problema: definição clara do problema; alternativas de solução relacionando com teorias e conceitos tecnológicos; originalidade; relevância social.',
                'type': 1,
                'number_alternatives': 10,
                'year': current_year,
                'created_at': datetime(2024, 10, 2, 13, 25, 22),
                'updated_at': datetime(2024, 10, 2, 13, 25, 22),
                'deleted_at': None,
            },
            {
                'id': 8,
                'scientific_text': 'Coleta de dados/metodologia: metodologia utilizada; seleção/aplicação de instrumentos de coleta; seleção da amostra (amostragem); análise e interpretação dos dados.',
                'technological_text': 'Coleta de dados/metodologia: metodologia utilizada; seleção/aplicação de instrumentos de coleta; seleção da amostra (amostragem); análise e interpretação dos dados.',
                'type': 1,
                'number_alternatives': 10,
                'year': current_year,
                'created_at': datetime(2024, 10, 2, 13, 25, 54),
                'updated_at': datetime(2024, 10, 2, 13, 25, 54),
                'deleted_at': None,
            },
            {
                'id': 9,
                'scientific_text': 'Elaboração do projeto/Metodologia: conhecimento científico; materiais e métodos; análises e interpretações de dados.',
                'technological_text': 'Elaboração do projeto/Metodologia: conhecimento tecnológico; materiais e métodos; análises e interpretações de dados.',
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
        print("✅ Seeder de questões concluído!") 