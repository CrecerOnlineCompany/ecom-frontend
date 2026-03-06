.PHONY: build deploy clean help

# Variables
PROJECT_DIR := $(shell pwd)
DIST_DIR := $(PROJECT_DIR)/dist
LARAVEL_PATH := $(PROJECT_DIR)/../cinea
BLADE_FILE := $(LARAVEL_PATH)/resources/views/welcome.blade.php
PUBLIC_ASSETS := $(LARAVEL_PATH)/public/assets

help:
	@echo "=== Makefile para Compilación y Despliegue de Cinea Frontend ==="
	@echo ""
	@echo "Comandos disponibles:"
	@echo "  make build      - Compila el proyecto para producción"
	@echo "  make deploy     - Compila y despliega los archivos"
	@echo "  make clean      - Elimina el directorio dist/"
	@echo "  make help       - Muestra esta ayuda"
	@echo ""

build:
	@echo "🔨 Compilando proyecto para producción..."
	npm run build
	@echo "✓ Build completado. Archivos en: $(DIST_DIR)"

deploy: 
	@echo ""
	@echo "📦 Desplegando archivos..."
	@echo ""
	npm run build

	@echo "1️⃣  Copiando HTML a Laravel..."
	@if [ ! -d "$(LARAVEL_PATH)" ]; then \
		echo "❌ Error: Directorio Laravel no encontrado en $(LARAVEL_PATH)"; \
		exit 1; \
	fi
	@if [ ! -f "$(DIST_DIR)/index.html" ]; then \
		echo "❌ Error: Archivo index.html no encontrado en $(DIST_DIR)"; \
		exit 1; \
	fi
	
	@mkdir -p "$(LARAVEL_PATH)/resources/views"
	@cp $(DIST_DIR)/index.html $(BLADE_FILE)
	@echo "   ✓ HTML copiado a: $(BLADE_FILE)"
	
	@echo ""
	@echo "2️⃣  Copiando assets a Laravel..."
	@mkdir -p "$(PUBLIC_ASSETS)"
	@if [ -d "$(DIST_DIR)/assets" ]; then \
		cp -r $(DIST_DIR)/assets/* $(PUBLIC_ASSETS)/; \
		echo "   ✓ Assets copiados a: $(PUBLIC_ASSETS)"; \
	else \
		echo "   ⚠️  No se encontró carpeta assets en dist/"; \
	fi
	
	@echo ""
	@echo "3️⃣  Subiendo por SFTP..."
	npm run deploy:sftp
	@echo "   ✓ Subida SFTP completada"
	@echo ""
	@echo "✅ ¡Despliegue completado exitosamente!"
	@echo ""
	@echo "📍 Resumen:"
	@echo "   - Blade view: $(BLADE_FILE)"
	@echo "   - Assets: $(PUBLIC_ASSETS)"
	@echo "   - SFTP: OK"

clean:
	@echo "🗑️  Eliminando directorio dist/"
	rm -rf $(DIST_DIR)
	@echo "✓ Limpieza completada"

.DEFAULT_GOAL := help
