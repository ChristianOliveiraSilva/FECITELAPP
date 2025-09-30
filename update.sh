
#!/bin/bash

# =============================================================================
# FECITEL APP UPDATE SCRIPT
# =============================================================================
# Script principal para atualização completa do sistema FECITEL
# Inclui: Backend, Frontend e App Mobile
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
LOG_FILE="/var/log/fecitel-update.log"
BACKUP_DIR="/var/backups/fecitel"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

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

# Função para criar backup antes da atualização
create_backup() {
    log "Criando backup do sistema antes da atualização..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
    fi
    
    # Backup do backend
    if [ -d "/var/www/fecitel/backend" ]; then
        tar -czf "$BACKUP_DIR/backend_$TIMESTAMP.tar.gz" -C /var/www/fecitel backend
        log_success "Backup do backend criado: backend_$TIMESTAMP.tar.gz"
    fi
    
    # Backup do frontend
    if [ -d "/var/www/fecitel/frontend" ]; then
        tar -czf "$BACKUP_DIR/frontend_$TIMESTAMP.tar.gz" -C /var/www/fecitel frontend
        log_success "Backup do frontend criado: frontend_$TIMESTAMP.tar.gz"
    fi
    
    # Backup do app
    if [ -d "/var/www/fecitel/app" ]; then
        tar -czf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" -C /var/www/fecitel app
        log_success "Backup do app criado: app_$TIMESTAMP.tar.gz"
    fi
}

# Função para rollback em caso de erro
rollback() {
    log_error "Erro detectado! Iniciando rollback..."
    
    if [ -f "$BACKUP_DIR/backend_$TIMESTAMP.tar.gz" ]; then
        log "Restaurando backup do backend..."
        tar -xzf "$BACKUP_DIR/backend_$TIMESTAMP.tar.gz" -C /var/www/fecitel/
        systemctl restart fecitel-backend
    fi
    
    if [ -f "$BACKUP_DIR/frontend_$TIMESTAMP.tar.gz" ]; then
        log "Restaurando backup do frontend..."
        tar -xzf "$BACKUP_DIR/frontend_$TIMESTAMP.tar.gz" -C /var/www/fecitel/
    fi
    
    if [ -f "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" ]; then
        log "Restaurando backup do app..."
        tar -xzf "$BACKUP_DIR/app_$TIMESTAMP.tar.gz" -C /var/www/fecitel/
    fi
    
    log_error "Rollback concluído. Verifique os logs em $LOG_FILE"
    exit 1
}

# Trap para capturar erros e fazer rollback
trap rollback ERR

# Verificações pré-atualização
log "Iniciando atualização do sistema FECITEL..."

# Verificar se os diretórios existem
if [ ! -d "/var/www/fecitel" ]; then
    log_error "Diretório /var/www/fecitel não encontrado!"
    exit 1
fi

# Verificar se o git está disponível
if ! command_exists git; then
    log_error "Git não está instalado!"
    exit 1
fi

# Verificar se o systemctl está disponível
if ! command_exists systemctl; then
    log_error "systemctl não está disponível!"
    exit 1
fi

# Criar backup antes de começar
create_backup

# Executar scripts de atualização
log "Executando atualização do backend..."
if ! ./update-back.sh; then
    log_error "Falha na atualização do backend!"
    exit 1
fi
log_success "Backend atualizado com sucesso!"

log "Executando atualização do frontend..."
if ! ./update-front.sh; then
    log_error "Falha na atualização do frontend!"
    exit 1
fi
log_success "Frontend atualizado com sucesso!"

log "Executando atualização do app..."
if ! ./update-app.sh; then
    log_error "Falha na atualização do app!"
    exit 1
fi
log_success "App atualizado com sucesso!"

# Verificação final do status dos serviços
log "Verificando status dos serviços..."

if systemctl is-active --quiet fecitel-backend; then
    log_success "Serviço fecitel-backend está ativo"
else
    log_warning "Serviço fecitel-backend não está ativo"
fi

# Limpeza de backups antigos (manter apenas os últimos 5)
log "Limpando backups antigos..."
cd "$BACKUP_DIR"
ls -t *.tar.gz | tail -n +6 | xargs -r rm -f
log_success "Limpeza de backups concluída"

log_success "Atualização completa do sistema FECITEL finalizada com sucesso!"
log "Logs salvos em: $LOG_FILE"
log "Backups salvos em: $BACKUP_DIR"
