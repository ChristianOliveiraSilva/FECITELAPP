# Fecitel API - FastAPI

API para sistema de avaliação de projetos Fecitel convertida de Laravel para FastAPI.

## Instalação

1. Clone o repositório
2. Crie um ambiente virtual:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Configure as variáveis de ambiente:
```bash
cp env.example .env
# Edite o arquivo .env com suas configurações
```

5. Execute as migrações (se necessário):
```bash
# Para SQLite (padrão), as tabelas são criadas automaticamente
# Para PostgreSQL, configure DATABASE_URL e execute:
# alembic upgrade head
```

## Executando a aplicação

```bash
uvicorn main:app --reload
```

A API estará disponível em `http://localhost:8000`

## Documentação da API

Acesse `http://localhost:8000/docs` para ver a documentação interativa da API.

## Endpoints

### Autenticação
- `POST /api/login` - Login com PIN
- `POST /api/logout` - Logout (requer autenticação)

### Avaliações
- `GET /api/assessments` - Listar avaliações do avaliador (requer autenticação)

### Questões
- `GET /api/questions/{assessment_id}` - Obter questões de uma avaliação (requer autenticação)

### Respostas
- `POST /api/responses` - Salvar respostas de uma avaliação (requer autenticação)

## Estrutura do Projeto

```
backend-fastapi/
├── app/
│   ├── models/          # Modelos SQLAlchemy
│   ├── schemas/         # Schemas Pydantic
│   ├── routers/         # Controllers/Routers
│   ├── enums/           # Enums
│   ├── utils/           # Utilitários
│   └── database.py      # Configuração do banco
├── main.py              # Aplicação principal
├── requirements.txt     # Dependências
└── README.md           # Este arquivo
```

## Modelos

- **User**: Usuários do sistema
- **Evaluator**: Avaliadores (relacionado com User)
- **Student**: Estudantes
- **School**: Escolas
- **Category**: Categorias de projetos
- **Project**: Projetos
- **Assessment**: Avaliações
- **Question**: Questões
- **Response**: Respostas
- **Award**: Prêmios

## Autenticação

A API usa JWT tokens para autenticação. O login é feito através do PIN do avaliador, que retorna um token JWT válido por 30 minutos. 