#!/usr/bin/env python3

import sys
import os
from sqlalchemy import text
from app.database import SessionLocal

db = SessionLocal()

query = """
SELECT 
    p.id AS "ID PROJETO",
    p.title,
    a.id AS "ID AVALIACAO",
    SUM(r.score) * 1.0 / COUNT(r.id) AS "nota final",
    SUM(r.score) AS "soma",
    COUNT(r.id) / 9 AS "total avals"

FROM projects p
JOIN assessments a ON p.id = a.project_id
JOIN responses r ON a.id = r.assessment_id

WHERE p.deleted_at IS NULL

GROUP BY p.id

ORDER BY "nota final" desc, "total avals" desc;
"""

print(f"\n=== Query ===")
print(f"SQL: {query}")
print("-" * 50)

try:
    result = db.execute(text(query))
    rows = result.fetchall()
    
    if rows:
        columns = result.keys()
        print(f"Colunas: {', '.join(columns)}")
        print()
        
        for row in rows:
            print(" | ".join(str(value) for value in row))
        
        print(f"\nTotal: {len(rows)} linha(s)")
    else:
        print("Nenhuma linha retornada")
        
except Exception as e:
    print(f"Erro: {e}")

db.close()
print("\n=== Fim ===")
