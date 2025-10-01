import csv
from app.models.evaluator import Evaluator
from app.models.user import User
from app.models.category import Category
from app.database import get_db
from sqlalchemy.orm import joinedload

def export_evaluators_to_csv():
    """
    Export all evaluators with their PIN, name, and areas to a CSV file.
    """
    db = next(get_db())
    
    try:
        # Query evaluators with their user and categories, ordered by name
        evaluators = db.query(Evaluator)\
            .options(
                joinedload(Evaluator.user),
                joinedload(Evaluator.categories)
            )\
            .join(User, Evaluator.user_id == User.id)\
            .filter(Evaluator.deleted_at == None)\
            .order_by(User.name)\
            .all()
        
        # Prepare CSV data
        csv_data = []
        for evaluator in evaluators:
            # Get user name
            user_name = evaluator.user.name if evaluator.user else "N/A"
            
            # Get categories (areas) as a comma-separated string
            areas = ", ".join([category.name for category in evaluator.categories]) if evaluator.categories else "N/A"
            
            csv_data.append({
                'PIN': evaluator.PIN,
                'Nome': user_name,
                'Areas': areas
            })
        
        # Write to CSV file
        csv_filename = 'avaliadores_lista.csv'
        with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['PIN', 'Nome', 'Areas']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            writer.writerows(csv_data)
        
        print(f"✅ Arquivo CSV criado com sucesso: {csv_filename}")
        print(f"📊 Total de avaliadores exportados: {len(csv_data)}")
        
        # Show a preview of the data
        print("\n📋 Preview dos dados:")
        print("-" * 50)
        for i, row in enumerate(csv_data[:5]):  # Show first 5 rows
            print(f"{i+1}. PIN: {row['PIN']} | Nome: {row['Nome']} | Areas: {row['Areas']}")
        
        if len(csv_data) > 5:
            print(f"... e mais {len(csv_data) - 5} avaliadores")
            
    except Exception as e:
        print(f"❌ Erro ao exportar dados: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    export_evaluators_to_csv()
