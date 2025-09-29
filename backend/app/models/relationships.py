from sqlalchemy import Column, Integer, ForeignKey, Table
from app.database import Base

evaluator_categories = Table(
    "evaluator_categories",
    Base.metadata,
    Column("evaluator_id", Integer, ForeignKey("evaluators.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True)
)

student_projects = Table(
    "student_projects",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.id"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True)
)

award_question = Table(
    "award_question",
    Base.metadata,
    Column("award_id", Integer, ForeignKey("awards.id"), primary_key=True),
    Column("question_id", Integer, ForeignKey("questions.id"), primary_key=True)
)

supervisor_projects = Table(
    "supervisor_projects",
    Base.metadata,
    Column("supervisor_id", Integer, ForeignKey("supervisors.id"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True)
)