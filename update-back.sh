
#!/bin/bash

# =============================================================================
# FECITEL BACKEND UPDATE SCRIPT
# =============================================================================
# Script para atualização do backend Python/FastAPI
# Inclui: Git pull, restart do serviço, instalação de dependências
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
BACKEND_DIR="/var/www/fecitel/backend"
SERVICE_NAME="fecitel-backend"
LOG_FILE="/var/log/fecitel-backend-update.log"

# Função de logging
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✓${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ✗${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠${NC} $1" | tee -a "$LOG_FILE"
}

# Função para verificar se o comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar se o serviço está ativo
is_service_active() {
    systemctl is-active --quiet "$SERVICE_NAME"
}

# Função para aguardar o serviço ficar ativo
wait_for_service() {
    local max_attempts=30
    local attempt=1
    
    log "Aguardando serviço $SERVICE_NAME ficar ativo..."
    
    while [ $attempt -le $max_attempts ]; do
        if is_service_active; then
            log_success "Serviço $SERVICE_NAME está ativo"
            return 0
        fi
        
        log "Tentativa $attempt/$max_attempts - Aguardando..."
        sleep 2
        ((attempt++))
    done
    
    log_error "Serviço $SERVICE_NAME não ficou ativo após $max_attempts tentativas"
    return 1
}

# Função para fazer backup do requirements.txt antes da atualização
backup_requirements() {
    if [ -f "$BACKEND_DIR/requirements.txt" ]; then
        cp "$BACKEND_DIR/requirements.txt" "$BACKEND_DIR/requirements.txt.backup"
        log "Backup do requirements.txt criado"
    fi
}

# Função para restaurar requirements.txt em caso de erro
restore_requirements() {
    if [ -f "$BACKEND_DIR/requirements.txt.backup" ]; then
        mv "$BACKEND_DIR/requirements.txt.backup" "$BACKEND_DIR/requirements.txt"
        log "requirements.txt restaurado do backup"
    fi
}

# Trap para capturar erros
trap 'log_error "Erro no script update-back.sh"; restore_requirements; exit 1' ERR

log "Iniciando atualização do backend FECITEL..."

# Verificações pré-atualização
if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Diretório $BACKEND_DIR não encontrado!"
    exit 1
fi

if ! command_exists git; then
    log_error "Git não está instalado!"
    exit 1
fi

if ! command_exists systemctl; then
    log_error "systemctl não está disponível!"
    exit 1
fi

if ! command_exists python3; then
    log_error "Python3 não está instalado!"
    exit 1
fi

# Navegar para o diretório do backend
cd "$BACKEND_DIR" || {
    log_error "Não foi possível navegar para $BACKEND_DIR"
    exit 1
}

# Verificar se é um repositório git
if [ ! -d ".git" ]; then
    log_error "Diretório não é um repositório git!"
    exit 1
fi

# Fazer backup do requirements.txt
backup_requirements

# Verificar status do git antes do pull
log "Verificando status do repositório git..."
git status --porcelain | head -10

# Fazer stash de mudanças locais se existirem
if ! git diff --quiet || ! git diff --cached --quiet; then
    log_warning "Mudanças locais detectadas. Fazendo stash..."
    git stash push -m "Auto-stash before update $(date)"
fi

# Fazer pull das atualizações
log "Fazendo pull das atualizações do repositório..."
if ! git pull; then
    log_error "Falha no git pull!"
    exit 1
fi
log_success "Git pull executado com sucesso"

# Verificar se o arquivo requirements.txt existe
if [ ! -f "requirements.txt" ]; then
    log_error "Arquivo requirements.txt não encontrado!"
    exit 1
fi

# Verificar se o ambiente virtual existe
if [ ! -d ".venv" ]; then
    log_warning "Ambiente virtual não encontrado. Criando..."
    python3 -m venv .venv
    log_success "Ambiente virtual criado"
fi

# Ativar ambiente virtual e instalar dependências
log "Ativando ambiente virtual e instalando dependências..."
source .venv/bin/activate

# Verificar se o pip está atualizado
log "Atualizando pip..."
pip install --upgrade pip

# Instalar dependências
log "Instalando dependências do requirements.txt..."
if ! pip install -r requirements.txt; then
    log_error "Falha na instalação das dependências!"
    deactivate
    exit 1
fi
log_success "Dependências instaladas com sucesso"

# Desativar ambiente virtual
deactivate

# Parar o serviço antes de reiniciar
log "Parando serviço $SERVICE_NAME..."
if systemctl is-active --quiet "$SERVICE_NAME"; then
    systemctl stop "$SERVICE_NAME"
    log "Serviço parado"
else
    log_warning "Serviço já estava parado"
fi

# Reiniciar o serviço
log "Iniciando serviço $SERVICE_NAME..."
if ! systemctl start "$SERVICE_NAME"; then
    log_error "Falha ao iniciar o serviço $SERVICE_NAME!"
    exit 1
fi

# Aguardar o serviço ficar ativo
if ! wait_for_service; then
    log_error "Serviço não ficou ativo após o restart!"
    systemctl status "$SERVICE_NAME" --no-pager
    exit 1
fi

# Verificar status final do serviço
log "Verificando status final do serviço..."
systemctl status "$SERVICE_NAME" --no-pager

# Verificar se o serviço está respondendo (opcional - pode ser customizado)
log "Verificando se o serviço está respondendo..."
if command_exists curl; then
    # Assumindo que o serviço roda na porta 8000 - ajuste conforme necessário
    if curl -f -s https://fecitel.cossoftware.com.br/api/ >/dev/null 2>&1; then
        log_success "Serviço está respondendo corretamente"
    else
        log_warning "Serviço pode não estar respondendo corretamente"
    fi
fi

# Limpeza
rm -f "$BACKEND_DIR/requirements.txt.backup"

log_success "Atualização do backend concluída com sucesso!"
log "Logs salvos em: $LOG_FILE"
