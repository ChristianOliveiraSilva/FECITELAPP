from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.project import Project
from app.models.student import Student
from app.models.supervisor import Supervisor
from app.models.category import Category
from app.models.school import School
from datetime import datetime
import pandas as pd
import tempfile
import os

router = APIRouter()

@router.post("/import/")
async def import_general_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        if not file.filename.endswith(('.xlsx', '.xls', '.xlsm')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only Excel files (.xlsx, .xls, .xlsm) are allowed."
            )
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Read Excel file
            df = pd.read_excel(tmp_file_path)
            df = df.fillna("")
            
            # Validate required columns
            required_columns = ['ID', 'TÍTULO', 'MODALIDADE', 'ÁREA', 'ESCOLA', 'AUTORES']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing required columns: {', '.join(missing_columns)}"
                )
            
            # Process data
            projects = []
            project_index = -1
            
            for idx, row in df.iterrows():
                if idx == 0:  # Skip header
                    continue
                
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
                        ] if 'Unnamed: 6' in df.columns and 'Unnamed: 7' in df.columns else [],
                        "ORIENTADOR": [],
                    })
                else:
                    if project_index >= 0 and len(projects) > project_index:
                        if row['AUTORES'] == 'ORIENTADOR(A)' or row['AUTORES'] == 'COORIENTADOR(A)':
                            if 'Unnamed: 6' in df.columns and 'Unnamed: 7' in df.columns:
                                projects[project_index]['ORIENTADOR'].append([
                                    str(row['Unnamed: 6']).strip(),
                                    str(row['Unnamed: 7']).strip()
                                ])
                        else:
                            if 'Unnamed: 6' in df.columns and 'Unnamed: 7' in df.columns:
                                projects[project_index]['ESTUDANTES'].append([
                                    str(row['Unnamed: 6']).strip(),
                                    str(row['Unnamed: 7']).strip()
                                ])
            
            # Get initial counts
            initial_project_count = db.query(Project).count()
            initial_student_count = db.query(Student).count()
            initial_supervisor_count = db.query(Supervisor).count()
            
            # Process projects
            created_projects = 0
            created_students = 0
            created_supervisors = 0
            
            for project_data in projects:
                # Find or create category
                category = db.query(Category).filter(Category.name.like(f"%{project_data['ÁREA']}%")).first()
                if not category:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Category '{project_data['ÁREA']}' not found. Please ensure the category exists in the system."
                    )
                
                # Find or create school
                school = db.query(School).filter(School.name.like(f"%{project_data['ESCOLA']}%")).first()
                if not school:
                    # Try with first word
                    primeira_palavra = project_data['ESCOLA'].split()[0] if project_data['ESCOLA'] else ""
                    if primeira_palavra:
                        school = db.query(School).filter(School.name.like(f"%{primeira_palavra}%")).first()
                
                if not school:
                    # Create new school
                    school = School(name=project_data['ESCOLA'])
                    db.add(school)
                    db.commit()
                    db.refresh(school)
                
                # Create project
                new_project = Project(
                    external_id=project_data['ID'],
                    title=project_data['TÍTULO'],
                    description="",
                    year=datetime.now().year,
                    category_id=category.id,
                    projectType=1,  # Default project type
                )
                db.add(new_project)
                db.commit()
                db.refresh(new_project)
                created_projects += 1
                
                # Determine school grade based on modality
                school_grade = 2 if project_data.get('MODALIDADE') == 'Médio' else 1
                
                # Create students
                for estudante in project_data['ESTUDANTES']:
                    name = estudante[0] if len(estudante) > 0 else ""
                    email = estudante[1] if len(estudante) > 1 else ""
                    
                    if not name:
                        continue
                    
                    student = Student(
                        name=name,
                        email=email,
                        year=datetime.now().year,
                        school_grade=school_grade,
                        school_id=school.id,
                    )
                    db.add(student)
                    db.commit()
                    db.refresh(student)
                    new_project.students.append(student)
                    created_students += 1
                
                # Create supervisors
                for orientador in project_data['ORIENTADOR']:
                    name = orientador[0] if len(orientador) > 0 else ""
                    email = orientador[1] if len(orientador) > 1 else ""
                    
                    if not name:
                        continue
                    
                    supervisor = Supervisor(
                        name=name,
                        email=email,
                        year=datetime.now().year,
                        school_id=school.id,
                    )
                    db.add(supervisor)
                    db.commit()
                    db.refresh(supervisor)
                    new_project.supervisors.append(supervisor)
                    created_supervisors += 1
            
            # Get final counts
            final_project_count = db.query(Project).count()
            final_student_count = db.query(Student).count()
            final_supervisor_count = db.query(Supervisor).count()
            
            return {
                "message": "Data imported successfully",
                "details": {
                    "file_name": file.filename,
                    "projects_created": created_projects,
                    "students_created": created_students,
                    "supervisors_created": created_supervisors,
                    "total_projects_before": initial_project_count,
                    "total_projects_after": final_project_count,
                    "total_students_before": initial_student_count,
                    "total_students_after": final_student_count,
                    "total_supervisors_before": initial_supervisor_count,
                    "total_supervisors_after": final_supervisor_count
                }
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error importing data: {str(e)}"
        )
