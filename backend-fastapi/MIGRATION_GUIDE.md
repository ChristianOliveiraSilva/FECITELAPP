# Guia de Migração: Laravel → FastAPI

Este documento descreve a conversão do projeto Laravel para FastAPI, mapeando as principais diferenças e equivalências.

## Estrutura de Arquivos

### Laravel → FastAPI

| Laravel | FastAPI | Descrição |
|---------|---------|-----------|
| `app/Models/` | `app/models/` | Modelos do banco de dados |
| `app/Http/Controllers/` | `app/routers/` | Controllers/Routers |
| `app/Enum/` | `app/enums/` | Enums do sistema |
| `routes/api.php` | `app/routers/*.py` | Definição de rotas |
| `config/` | `app/database.py` | Configurações |
| `composer.json` | `requirements.txt` | Dependências |

## Modelos (Models)

### Laravel Eloquent → SQLAlchemy

| Laravel | FastAPI | Descrição |
|---------|---------|-----------|
| `use HasFactory, SoftDeletes` | `deleted_at` column | Soft deletes |
| `protected $fillable` | `__init__` method | Campos preenchíveis |
| `protected $casts` | Python types | Conversão de tipos |
| `belongsTo()` | `relationship()` | Relacionamentos |
| `hasMany()` | `relationship()` | Relacionamentos |
| `belongsToMany()` | `secondary` parameter | Relacionamentos N:N |

### Exemplo de Conversão

**Laravel:**
```php
class User extends Authenticatable
{
    protected $fillable = ['name', 'email', 'password'];
    
    public function evaluator()
    {
        return $this->hasOne(Evaluator::class);
    }
}
```

**FastAPI:**
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    
    evaluator = relationship("Evaluator", back_populates="user", uselist=False)
```

## Controllers → Routers

### Laravel Controller → FastAPI Router

| Laravel | FastAPI | Descrição |
|---------|---------|-----------|
| `class Controller` | `APIRouter()` | Definição de rotas |
| `public function index()` | `@router.get()` | Endpoints GET |
| `public function store()` | `@router.post()` | Endpoints POST |
| `Request $request` | `request: Model` | Validação de dados |
| `return response()->json()` | `return Model()` | Respostas JSON |

### Exemplo de Conversão

**Laravel:**
```php
class AssessmentController extends Controller
{
    public function index()
    {
        $assessments = Auth::user()->evaluator->assessments()
            ->with(['project.students', 'project.category'])
            ->get();
            
        return response()->json([
            'status' => true,
            'data' => $assessments
        ]);
    }
}
```

**FastAPI:**
```python
@router.get("/assessments", response_model=AssessmentResponse)
async def get_assessments(
    current_user: User = Depends(get_current_evaluator),
    db: Session = Depends(get_db)
):
    assessments = db.query(Assessment).filter(
        Assessment.evaluator_id == evaluator.id
    ).all()
    
    return AssessmentResponse(
        status=True,
        data=assessments
    )
```

## Autenticação

### Laravel Sanctum → JWT

| Laravel | FastAPI | Descrição |
|---------|---------|-----------|
| `auth:sanctum` middleware | `Depends(get_current_user)` | Autenticação |
| `Auth::user()` | `current_user` parameter | Usuário atual |
| `createToken()` | `create_access_token()` | Criação de tokens |
| `tokens()->delete()` | JWT blacklist | Logout |

### Exemplo de Conversão

**Laravel:**
```php
Route::group(['middleware' => 'auth:sanctum'], function () {
    Route::get('/assessments', [AssessmentController::class, 'index']);
});
```

**FastAPI:**
```python
@router.get("/assessments")
async def get_assessments(current_user: User = Depends(get_current_user)):
    # Implementation
```

## Validação de Dados

### Laravel Request → Pydantic Schemas

| Laravel | FastAPI | Descrição |
|---------|---------|-----------|
| `Request::validate()` | `Pydantic models` | Validação |
| `$request->all()` | `request.dict()` | Dados da requisição |
| `$request->input()` | `request.field` | Campos específicos |

### Exemplo de Conversão

**Laravel:**
```php
$request->validate([
    'PIN' => 'required',
]);
```

**FastAPI:**
```python
class LoginRequest(BaseModel):
    PIN: str
```

## Enums

### Laravel Enum → Python Enum

| Laravel | FastAPI | Descrição |
|---------|---------|-----------|
| `enum QuestionTypeEnum` | `class QuestionType(Enum)` | Definição de enums |
| `getLabel()` | `get_label()` | Métodos de enum |
| `getValues()` | `get_values()` | Valores do enum |

### Exemplo de Conversão

**Laravel:**
```php
enum QuestionTypeEnum: int
{
    case MULTIPLE_CHOICE = 1;
    case TEXT = 2;
    
    public function getLabel(): string
    {
        return match ($this) {
            self::MULTIPLE_CHOICE => 'Questão de Múltipla Escolha',
            self::TEXT => 'Questão de Texto',
        };
    }
}
```

**FastAPI:**
```python
class QuestionType(Enum):
    MULTIPLE_CHOICE = 1
    TEXT = 2
    
    def get_label(self) -> str:
        return {
            self.MULTIPLE_CHOICE: "Questão de Múltipla Escolha",
            self.TEXT: "Questão de Texto",
        }[self]
```

## Banco de Dados

### Laravel Migrations → Alembic

| Laravel | FastAPI | Descrição |
|---------|---------|-----------|
| `php artisan migrate` | `alembic upgrade head` | Executar migrações |
| `php artisan make:migration` | `alembic revision` | Criar migração |
| `Schema::create()` | `op.create_table()` | Criar tabelas |

## Configuração

### Laravel Config → FastAPI Settings

| Laravel | FastAPI | Descrição |
|---------|---------|-----------|
| `.env` | `.env` | Variáveis de ambiente |
| `config/` | `app/database.py` | Configurações |
| `config('app.key')` | `settings.secret_key` | Acesso a configs |

## Principais Diferenças

1. **Tipagem**: FastAPI usa tipagem estática com Pydantic
2. **Performance**: FastAPI é mais rápido que Laravel
3. **Async**: FastAPI suporta async/await nativamente
4. **Documentação**: FastAPI gera documentação automática
5. **Validação**: Pydantic oferece validação mais robusta
6. **Dependências**: Python vs PHP ecosystem

## Endpoints Convertidos

| Laravel Route | FastAPI Route | Método | Descrição |
|---------------|---------------|--------|-----------|
| `POST /api/login` | `POST /api/login` | POST | Login com PIN |
| `POST /api/logout` | `POST /api/logout` | POST | Logout |
| `GET /api/assessments` | `GET /api/assessments` | GET | Listar avaliações |
| `GET /api/questions/{id}` | `GET /api/questions/{id}` | GET | Questões da avaliação |
| `POST /api/responses` | `POST /api/responses` | POST | Salvar respostas |

## Próximos Passos

1. Configurar banco de dados (PostgreSQL recomendado)
2. Implementar seeders para dados de teste
3. Adicionar testes unitários
4. Configurar CI/CD
5. Implementar logging
6. Adicionar monitoramento 