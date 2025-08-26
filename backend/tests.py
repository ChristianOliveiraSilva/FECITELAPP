from app.models.assessment import Assessment
from app.models.project import Project
from app.models.response import Response
from app.database import get_db
from sqlalchemy import or_, not_, exists, and_, func, distinct
from datetime import datetime

if __name__ == "__main__":
    db = next(get_db())

    db.query(Response).delete()
    db.commit()

    for assessment_id in [1,2,3,4,5,6,7,8,10,11,12]:
        nova_response = Response(
            question_id=1,
            assessment_id=assessment_id,
            response="Exemplo de resposta",
            score=10,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            deleted_at=None
        )
        nova_response = Response(
            question_id=2,
            assessment_id=assessment_id,
            response="Exemplo de resposta",
            score=10,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            deleted_at=None
        )
        db.add(nova_response)
        db.commit()
        db.refresh(nova_response)
    
    assessments_count = db.query(Assessment).filter(Assessment.deleted_at == None).count()
    print("Assessments count:", assessments_count)

    responses_count = db.query(Response).filter(Response.deleted_at == None).count()
    print("Responses count:", responses_count)
    
    projects_count = db.query(Project).filter(Project.deleted_at == None).count()
    print("Projects count:", projects_count)