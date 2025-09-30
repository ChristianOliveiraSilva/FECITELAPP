
#!/bin/bash

# =============================================================================
# FECITEL FRONTEND UPDATE SCRIPT
# =============================================================================
# Script para atualização do frontend React/Vue/Angular
# Inclui: Git pull, instalação de dependências, build
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
FRONTEND_DIR="/var/www/fecitel/frontend"
LOG_FILE="/var/log/fecitel-frontend-update.log"
BUILD_DIR="dist"  # Ajuste conforme seu framework (dist, build, public, etc.)

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

# Função para detectar o gerenciador de pacotes
detect_package_manager() {
    if [ -f "package-lock.json" ]; then
        echo "npm"
    elif [ -f "yarn.lock" ]; then
        echo "yarn"
    elif [ -f "pnpm-lock.yaml" ]; then
        echo "pnpm"
    else
        echo "npm"  # Default
    fi
}

# Função para instalar dependências
install_dependencies() {
    local package_manager=$1
    
    log "Instalando dependências com $package_manager..."
    
    case $package_manager in
        "npm")
            if ! npm ci --silent; then
                log_warning "npm ci falhou, tentando npm install..."
                if ! npm install --silent; then
                    log_error "Falha na instalação com npm!"
                    return 1
                fi
            fi
            ;;
        "yarn")
            if ! yarn install --frozen-lockfile --silent; then
                log_warning "yarn install --frozen-lockfile falhou, tentando yarn install..."
                if ! yarn install --silent; then
                    log_error "Falha na instalação com yarn!"
                    return 1
                fi
            fi
            ;;
        "pnpm")
            if ! pnpm install --frozen-lockfile --silent; then
                log_warning "pnpm install --frozen-lockfile falhou, tentando pnpm install..."
                if ! pnpm install --silent; then
                    log_error "Falha na instalação com pnpm!"
                    return 1
                fi
            fi
            ;;
    esac
    
    log_success "Dependências instaladas com sucesso"
    return 0
}

# Função para fazer build
build_project() {
    local package_manager=$1
    
    log "Iniciando build do projeto..."
    
    # Verificar se o script de build existe
    if ! grep -q '"build"' package.json; then
        log_error "Script 'build' não encontrado no package.json!"
        return 1
    fi
    
    # Fazer backup do build anterior se existir
    if [ -d "$BUILD_DIR" ]; then
        log "Fazendo backup do build anterior..."
        mv "$BUILD_DIR" "${BUILD_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Executar build
    case $package_manager in
        "npm")
            if ! npm run build; then
                log_error "Falha no build com npm!"
                return 1
            fi
            ;;
        "yarn")
            if ! yarn build; then
                log_error "Falha no build com yarn!"
                return 1
            fi
            ;;
        "pnpm")
            if ! pnpm build; then
                log_error "Falha no build com pnpm!"
                return 1
            fi
            ;;
    esac
    
    # Verificar se o build foi criado
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Diretório de build $BUILD_DIR não foi criado!"
        return 1
    fi
    
    log_success "Build concluído com sucesso"
    return 0
}

# Função para limpar cache
clean_cache() {
    local package_manager=$1
    
    log "Limpando cache..."
    
    case $package_manager in
        "npm")
            npm cache clean --force 2>/dev/null || true
            ;;
        "yarn")
            yarn cache clean 2>/dev/null || true
            ;;
        "pnpm")
            pnpm store prune 2>/dev/null || true
            ;;
    esac
    
    log_success "Cache limpo"
}

# Trap para capturar erros
trap 'log_error "Erro no script update-front.sh"; exit 1' ERR

log "Iniciando atualização do frontend FECITEL..."

# Verificações pré-atualização
if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "Diretório $FRONTEND_DIR não encontrado!"
    exit 1
fi

if ! command_exists git; then
    log_error "Git não está instalado!"
    exit 1
fi

# Navegar para o diretório do frontend
cd "$FRONTEND_DIR" || {
    log_error "Não foi possível navegar para $FRONTEND_DIR"
    exit 1
}

# Verificar se é um repositório git
if [ ! -d ".git" ]; then
    log_error "Diretório não é um repositório git!"
    exit 1
fi

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    log_error "Arquivo package.json não encontrado!"
    exit 1
fi

# Detectar gerenciador de pacotes
PACKAGE_MANAGER=$(detect_package_manager)
log "Gerenciador de pacotes detectado: $PACKAGE_MANAGER"

# Verificar se o gerenciador de pacotes está instalado
if ! command_exists "$PACKAGE_MANAGER"; then
    log_error "$PACKAGE_MANAGER não está instalado!"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command_exists node; then
    log_error "Node.js não está instalado!"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
log "Versão do Node.js: $NODE_VERSION"

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

# Limpar cache antes de instalar dependências
clean_cache "$PACKAGE_MANAGER"

# Instalar dependências
if ! install_dependencies "$PACKAGE_MANAGER"; then
    log_error "Falha na instalação das dependências!"
    exit 1
fi

# Fazer build do projeto
if ! build_project "$PACKAGE_MANAGER"; then
    log_error "Falha no build do projeto!"
    exit 1
fi

# Verificar tamanho do build
if [ -d "$BUILD_DIR" ]; then
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    log_success "Build criado com sucesso - Tamanho: $BUILD_SIZE"
    
    # Listar arquivos principais do build
    log "Arquivos principais do build:"
    find "$BUILD_DIR" -type f -name "*.html" -o -name "*.js" -o -name "*.css" | head -10 | while read -r file; do
        log "  - $file"
    done
fi

# Limpeza de arquivos temporários
log "Limpando arquivos temporários..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next 2>/dev/null || true  # Next.js
rm -rf .nuxt 2>/dev/null || true  # Nuxt.js
rm -rf .vuepress/dist 2>/dev/null || true  # VuePress

log_success "Atualização do frontend concluída com sucesso!"
log "Logs salvos em: $LOG_FILE"

