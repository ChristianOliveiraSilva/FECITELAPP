from app.models.assessment import Assessment
from app.models.project import Project
from app.models.response import Response
from app.models.student import Student
from app.models.supervisor import Supervisor
from app.models.category import Category
from app.models.school import School
from app.database import get_db, SessionLocal
from sqlalchemy import or_, not_, exists, and_, func, distinct
from datetime import datetime
from pprint import pprint
import pandas as pd
import os

if __name__ == "__main__":
    excel_file_path = "./Trabalhos FECITEL.xlsx"
    
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
        
        print("\n=== LINHAS ===\n\n")
        projects = []
        project_index = -1
        for idx, row in df.iterrows():
            if idx == 0:
                continue

            print(f"Linha {idx}:")
            print(row.to_string())
            print("-" * 40)

            if row['ID']:
                project_index += 1
                project_id = str(int(float(row['ID']))) if pd.notna(row['ID']) else ""
                
                projects.append({
                    "ID": project_id,
                    "TÍTULO": str(row['TÍTULO']).strip(),
                    "MODALIDADE": str(row['MODALIDADE']).strip(),
                    "ÁREA": str(row['ÁREA']).strip(),
                    "ESCOLA": str(row['ESCOLA']).strip(),
                    "ESTUDANTES": [
                        [
                            str(row['Unnamed: 6']).strip(),
                            str(row['Unnamed: 7']).strip()
                        ]
                    ],
                    "ORIENTADOR": [],
                })
            else:
                if row['AUTORES'] == 'ORIENTADOR(A)' or row['AUTORES'] == 'COORIENTADOR(A)':
                    projects[project_index]['ORIENTADOR'].append([
                        str(row['Unnamed: 6']).strip(),
                        str(row['Unnamed: 7']).strip()
                    ])
                else:
                    projects[project_index]['ESTUDANTES'].append([
                        str(row['Unnamed: 6']).strip(),
                        str(row['Unnamed: 7']).strip()
                    ])

            # if idx == 650:
            #     break

        print("\n=== PROJETOS FORMATADOS ===")
        for i, project in enumerate(projects, 1):
            print(f"\nProjeto {i}:")
            for key, value in project.items():
                if isinstance(value, list):
                    print(f"  {key}:")
                    for item in value:
                        print(f"    - {item}")
                else:
                    print(f"  {key}: {value}")

        # Criar sessão do banco de dados
        db = SessionLocal()
        
        project_count = db.query(Project).count()
        student_count = db.query(Student).count()
        supervisor_count = db.query(Supervisor).count()
        print(f"Total de projetos ANTES DE RODAR OS INSERTs: {project_count}")
        print(f"Total de estudantes ANTES DE RODAR OS INSERTs: {student_count}")
        print(f"Total de orientadores ANTES DE RODAR OS INSERTs: {supervisor_count}")

        # criando projetos
        for project_data in projects:
            # pegar a categoria
            category = db.query(Category).filter(Category.name.like(f"%{project_data['ÁREA']}%")).first()
            if not category:
                print(f"Categoria '{project_data['ÁREA']}' não encontrada. Encerrando o programa.")
                db.close()
                exit(1)

            # pegar a escola
            school = db.query(School).filter(School.name.like(f"%{project_data['ESCOLA']}%")).first()
            if not school:
                primeira_palavra = project_data['ESCOLA'].split()[0]
                school = db.query(School).filter(School.name.like(f"%{primeira_palavra}%")).first()
            if not school:
                school = School(name=project_data['ESCOLA'])
                db.add(school)
                db.commit()
            
            if not school:
                print(f"Escola '{project_data['ESCOLA']}' não encontrada. Encerrando o programa.")
                db.close()
                exit(1)

            new_project = Project(
                external_id=project_data['ID'],
                title=project_data['TÍTULO'],
                description="",
                year=datetime.now().year,
                category_id=category.id,
                projectType=1, # mocado pq os caras nn colocaram na importação 🙄
            )
            db.add(new_project)
            db.commit()

            school_grade = 2 if project_data.get('MODALIDADE') == 'Médio' else 1

            for estudante in project_data['ESTUDANTES']:
                name = estudante[0]
                email = estudante[1]
                if not name:
                    break

                student = Student(
                    name=name,
                    email=email,
                    year=datetime.now().year,
                    school_grade=school_grade,
                    school_id=school.id,
                )
                db.add(student)
                db.commit()
                new_project.students.append(student)

            # Criando orientadores
            for orientador in project_data['ORIENTADOR']:
                name = orientador[0]
                email = orientador[1]
                if not name:
                    break

                supervisor = Supervisor(
                    name=name,
                    email=email,
                    year=datetime.now().year,
                    school_id=school.id,
                )
                db.add(supervisor)
                db.commit()
                new_project.supervisors.append(supervisor)

        project_count = db.query(Project).count()
        student_count = db.query(Student).count()
        supervisor_count = db.query(Supervisor).count()
        print(f"Total de projetos DEPOIS DE RODAR OS INSERTs: {project_count}")
        print(f"Total de estudantes DEPOIS DE RODAR OS INSERTs: {student_count}")
        print(f"Total de orientadores DEPOIS DE RODAR OS INSERTs: {supervisor_count}")
        
        # Fechar a sessão
        db.close()
        
    except FileNotFoundError:
        print(f"Erro: Arquivo não encontrado em {excel_file_path}")
    except Exception as e:
        print(f"Erro ao ler o arquivo: {str(e)}")