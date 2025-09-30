

#!/bin/bash

# =============================================================================
# FECITEL APP UPDATE SCRIPT
# =============================================================================
# Script para atualização do app mobile (React Native/Flutter/Ionic)
# Inclui: Git pull, instalação de dependências, build (opcional)
# =============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
APP_DIR="/var/www/fecitel/app"
LOG_FILE="/var/log/fecitel-app-update.log"
BUILD_APP=${BUILD_APP:-false}  # Variável de ambiente para controlar build

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

# Função para detectar o tipo de app
detect_app_type() {
    if [ -f "package.json" ]; then
        if grep -q "react-native" package.json; then
            echo "react-native"
        elif grep -q "ionic" package.json; then
            echo "ionic"
        elif grep -q "cordova" package.json; then
            echo "cordova"
        else
            echo "node"
        fi
    elif [ -f "pubspec.yaml" ]; then
        echo "flutter"
    elif [ -f "android/app/build.gradle" ] || [ -f "ios/Podfile" ]; then
        echo "native"
    else
        echo "unknown"
    fi
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
    local app_type=$2
    
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
    
    # Instalações específicas por tipo de app
    case $app_type in
        "react-native")
            log "Executando configurações específicas do React Native..."
            # Verificar se o React Native CLI está instalado
            if ! command_exists react-native; then
                log "Instalando React Native CLI globalmente..."
                npm install -g @react-native-community/cli
            fi
            
            # Instalar dependências nativas (iOS)
            if [ -d "ios" ] && command_exists pod; then
                log "Instalando dependências nativas do iOS..."
                cd ios && pod install && cd ..
            fi
            ;;
        "ionic")
            log "Executando configurações específicas do Ionic..."
            if ! command_exists ionic; then
                log "Instalando Ionic CLI globalmente..."
                npm install -g @ionic/cli
            fi
            ;;
        "cordova")
            log "Executando configurações específicas do Cordova..."
            if ! command_exists cordova; then
                log "Instalando Cordova CLI globalmente..."
                npm install -g cordova
            fi
            ;;
        "flutter")
            log "Executando configurações específicas do Flutter..."
            if ! command_exists flutter; then
                log_error "Flutter não está instalado!"
                return 1
            fi
            
            # Verificar se o Flutter está configurado
            flutter doctor --android-licenses || true
            
            # Instalar dependências do Flutter
            flutter pub get
            ;;
    esac
    
    log_success "Dependências instaladas com sucesso"
    return 0
}

# Função para fazer build do app
build_app() {
    local package_manager=$1
    local app_type=$2
    
    if [ "$BUILD_APP" != "true" ]; then
        log "Build do app desabilitado (defina BUILD_APP=true para habilitar)"
        return 0
    fi
    
    log "Iniciando build do app..."
    
    case $app_type in
        "react-native")
            log "Fazendo build do React Native..."
            
            # Build para Android
            if [ -d "android" ]; then
                log "Build para Android..."
                if ! npx react-native run-android --mode=release; then
                    log_warning "Build do Android falhou, tentando build manual..."
                    cd android && ./gradlew assembleRelease && cd ..
                fi
            fi
            
            # Build para iOS
            if [ -d "ios" ] && command_exists xcodebuild; then
                log "Build para iOS..."
                cd ios && xcodebuild -workspace *.xcworkspace -scheme *.xcscheme -configuration Release -destination generic/platform=iOS -archivePath build/App.xcarchive archive && cd ..
            fi
            ;;
        "ionic")
            log "Fazendo build do Ionic..."
            
            # Build para Android
            if [ -d "platforms/android" ]; then
                ionic capacitor build android --prod
            fi
            
            # Build para iOS
            if [ -d "platforms/ios" ]; then
                ionic capacitor build ios --prod
            fi
            ;;
        "cordova")
            log "Fazendo build do Cordova..."
            
            # Build para Android
            if [ -d "platforms/android" ]; then
                cordova build android --release
            fi
            
            # Build para iOS
            if [ -d "platforms/ios" ]; then
                cordova build ios --release
            fi
            ;;
        "flutter")
            log "Fazendo build do Flutter..."
            
            # Build para Android
            if [ -d "android" ]; then
                flutter build apk --release
            fi
            
            # Build para iOS
            if [ -d "ios" ]; then
                flutter build ios --release
            fi
            ;;
        *)
            log_warning "Tipo de app não suportado para build: $app_type"
            ;;
    esac
    
    log_success "Build do app concluído"
}

# Função para limpar cache
clean_cache() {
    local package_manager=$1
    local app_type=$2
    
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
    
    # Limpeza específica por tipo de app
    case $app_type in
        "react-native")
            # Limpar cache do React Native
            npx react-native start --reset-cache &
            sleep 5
            pkill -f "react-native start" || true
            ;;
        "flutter")
            flutter clean
            ;;
    esac
    
    log_success "Cache limpo"
}

# Trap para capturar erros
trap 'log_error "Erro no script update-app.sh"; exit 1' ERR

log "Iniciando atualização do app FECITEL..."

# Verificações pré-atualização
if [ ! -d "$APP_DIR" ]; then
    log_error "Diretório $APP_DIR não encontrado!"
    exit 1
fi

if ! command_exists git; then
    log_error "Git não está instalado!"
    exit 1
fi

# Navegar para o diretório do app
cd "$APP_DIR" || {
    log_error "Não foi possível navegar para $APP_DIR"
    exit 1
}

# Verificar se é um repositório git
if [ ! -d ".git" ]; then
    log_error "Diretório não é um repositório git!"
    exit 1
fi

# Detectar tipo de app
APP_TYPE=$(detect_app_type)
log "Tipo de app detectado: $APP_TYPE"

# Verificar se package.json existe (para apps Node.js)
if [ "$APP_TYPE" != "flutter" ] && [ "$APP_TYPE" != "native" ] && [ ! -f "package.json" ]; then
    log_error "Arquivo package.json não encontrado!"
    exit 1
fi

# Detectar gerenciador de pacotes (para apps Node.js)
if [ "$APP_TYPE" != "flutter" ] && [ "$APP_TYPE" != "native" ]; then
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
fi

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

# Instalar dependências (para apps Node.js)
if [ "$APP_TYPE" != "flutter" ] && [ "$APP_TYPE" != "native" ]; then
    # Limpar cache antes de instalar dependências
    clean_cache "$PACKAGE_MANAGER" "$APP_TYPE"
    
    # Instalar dependências
    if ! install_dependencies "$PACKAGE_MANAGER" "$APP_TYPE"; then
        log_error "Falha na instalação das dependências!"
        exit 1
    fi
fi

# Fazer build do app (se habilitado)
build_app "$PACKAGE_MANAGER" "$APP_TYPE"

# Verificar estrutura do projeto
log "Verificando estrutura do projeto:"
case $APP_TYPE in
    "react-native")
        if [ -d "android" ]; then
            log "  - Diretório Android: ✓"
        fi
        if [ -d "ios" ]; then
            log "  - Diretório iOS: ✓"
        fi
        ;;
    "flutter")
        if [ -d "android" ]; then
            log "  - Diretório Android: ✓"
        fi
        if [ -d "ios" ]; then
            log "  - Diretório iOS: ✓"
        fi
        if [ -d "lib" ]; then
            log "  - Diretório lib: ✓"
        fi
        ;;
    "ionic"|"cordova")
        if [ -d "platforms" ]; then
            log "  - Diretório platforms: ✓"
        fi
        if [ -d "www" ]; then
            log "  - Diretório www: ✓"
        fi
        ;;
esac

# Limpeza de arquivos temporários
log "Limpando arquivos temporários..."
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .expo 2>/dev/null || true  # Expo
rm -rf build 2>/dev/null || true  # Builds temporários

log_success "Atualização do app concluída com sucesso!"
log "Logs salvos em: $LOG_FILE"

