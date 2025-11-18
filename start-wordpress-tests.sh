#!/bin/bash

##
# WordPress Test Environment Startup Script
# Startet eine komplette WordPress-Test-Umgebung mit Docker
##

set -e

echo "🚀 Starting WordPress Test Environment for YPrint Designer Plugin"
echo "=================================================================="

# Farben für die Ausgabe
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funktionen
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Prüfe Docker Installation
check_docker() {
    print_status "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are available"
}

# Stoppe eventuell laufende Container
stop_existing_containers() {
    print_status "Stopping existing test containers..."

    # Stoppe Container falls sie laufen
    docker-compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true

    # Entferne eventuell verwaiste Container
    docker ps -aq --filter "name=yprint-*" | xargs -r docker rm -f 2>/dev/null || true

    print_success "Existing containers stopped"
}

# Bereite Verzeichnisse vor
prepare_directories() {
    print_status "Preparing directories..."

    # Erstelle notwendige Verzeichnisse
    mkdir -p wp-test-data/themes
    mkdir -p wp-test-data/plugins
    mkdir -p wp-test-data/uploads
    mkdir -p test-results

    # Setze Berechtigungen
    chmod 755 wp-test-data
    chmod 755 test-results

    print_success "Directories prepared"
}

# Kopiere Plugin-Code
prepare_plugin() {
    print_status "Preparing plugin code..."

    # Stelle sicher, dass der public-Ordner existiert
    if [ ! -d "public" ]; then
        print_error "Public directory not found. Please run this script from the plugin root directory."
        exit 1
    fi

    # Plugin-Verzeichnis in wp-content/plugins vorbereiten
    mkdir -p wp-test-data/plugins/octo-print-designer

    print_success "Plugin code prepared"
}

# Starte Docker Container
start_containers() {
    print_status "Starting Docker containers..."

    # Baue und starte alle Container
    docker-compose -f docker-compose.yml up -d --build

    if [ $? -eq 0 ]; then
        print_success "Docker containers started successfully"
    else
        print_error "Failed to start Docker containers"
        exit 1
    fi
}

# Warte auf WordPress
wait_for_wordpress() {
    print_status "Waiting for WordPress to be ready..."

    local max_attempts=60
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:8081 > /dev/null 2>&1; then
            print_success "WordPress is ready!"
            break
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    if [ $attempt -gt $max_attempts ]; then
        print_error "WordPress failed to start within expected time"
        show_logs
        exit 1
    fi
}

# Installiere WordPress und aktiviere Plugin
setup_wordpress() {
    print_status "Setting up WordPress and activating plugin..."

    # Warte zusätzliche Zeit für Datenbank-Setup
    sleep 10

    # WordPress CLI-Befehle über Docker ausführen
    docker exec yprint-wp-test wp core install \
        --url="http://localhost:8081" \
        --title="YPrint Designer Test" \
        --admin_user="admin" \
        --admin_password="admin123" \
        --admin_email="admin@test.local" \
        --allow-root 2>/dev/null || print_warning "WordPress might already be installed"

    # Plugin aktivieren
    docker exec yprint-wp-test wp plugin activate octo-print-designer --allow-root 2>/dev/null || true

    print_success "WordPress setup completed"
}

# Starte Tests
start_tests() {
    print_status "Starting automated tests..."

    # Starte Test-Container
    docker-compose -f docker-compose.yml up puppeteer-test

    print_success "Tests completed. Check test-results/ directory for results."
}

# Zeige Logs
show_logs() {
    print_status "Container logs:"
    echo "=================="
    docker-compose -f docker-compose.yml logs --tail=50
}

# Zeige Zugangsinformationen
show_access_info() {
    print_success "WordPress Test Environment is ready!"
    echo ""
    echo "🌐 Access URLs:"
    echo "   WordPress Admin: http://localhost:8081/wp-admin"
    echo "   Username: admin"
    echo "   Password: admin123"
    echo ""
    echo "   WordPress Frontend: http://localhost:8081"
    echo "   phpMyAdmin: http://localhost:8082"
    echo "   WebSocket Server: ws://localhost:8083"
    echo ""
    echo "📊 Test Results: ./test-results/"
    echo ""
    echo "🔧 Useful Commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop: docker-compose down"
    echo "   Restart tests: docker-compose up puppeteer-test"
    echo ""
}

# Cleanup-Funktion für SIGINT
cleanup() {
    print_warning "Received interrupt signal. Cleaning up..."
    docker-compose -f docker-compose.yml down
    exit 0
}

# Signal-Handler registrieren
trap cleanup SIGINT

# Hauptausführung
main() {
    echo ""
    print_status "Starting WordPress Test Environment Setup..."

    check_docker
    stop_existing_containers
    prepare_directories
    prepare_plugin
    start_containers
    wait_for_wordpress
    setup_wordpress

    show_access_info

    # Frage ob Tests gestartet werden sollen
    echo ""
    read -p "Do you want to run automated tests now? (y/n): " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_tests
    else
        print_status "Tests skipped. You can run them later with:"
        echo "docker-compose up puppeteer-test"
    fi

    print_status "Setup completed successfully!"
    echo ""
    print_status "The WordPress test environment is now running."
    print_status "Press Ctrl+C to stop all containers."

    # Warte auf Benutzer-Interrupt
    while true; do
        sleep 1
    done
}

# Prüfe Kommandozeilen-Argumente
case "$1" in
    "stop")
        print_status "Stopping WordPress test environment..."
        docker-compose -f docker-compose.yml down --remove-orphans
        print_success "Environment stopped"
        ;;
    "logs")
        show_logs
        ;;
    "test")
        print_status "Running tests only..."
        start_tests
        ;;
    "restart")
        print_status "Restarting WordPress test environment..."
        stop_existing_containers
        start_containers
        wait_for_wordpress
        show_access_info
        ;;
    *)
        main
        ;;
esac