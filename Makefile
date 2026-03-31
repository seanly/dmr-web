.PHONY: install build dev clean

PKG_MANAGER := $(shell command -v pnpm 2>/dev/null && echo pnpm || echo npm)
INSTALL_DIR := $(HOME)/.dmr/web

install: build
	@echo "Installing DMR Web UI to $(INSTALL_DIR)/dist..."
	@mkdir -p $(INSTALL_DIR)
	@rm -rf $(INSTALL_DIR)/dist
	@cp -r dist $(INSTALL_DIR)/
	@echo "✓ DMR Web UI installed successfully"
	@echo ""
	@echo "Configure DMR to use the UI:"
	@echo "  [[plugins]]"
	@echo "  name = \"web\""
	@echo "  enabled = true"
	@echo ""
	@echo "  [plugins.config.server]"
	@echo "  enabled = true"
	@echo "  listen = \":8080\""
	@echo "  ui_path = \"~/.dmr/web/dist\""

build:
	@echo "Building DMR Web UI..."
	@$(PKG_MANAGER) install
	@$(PKG_MANAGER) run build
	@echo "✓ Build complete"

dev:
	@echo "Starting DMR Web UI dev server..."
	@echo "Configure DMR to use: ui_url = \"http://localhost:5173\""
	@$(PKG_MANAGER) run dev

clean:
	@echo "Cleaning build artifacts..."
	@rm -rf dist node_modules pnpm-lock.yaml package-lock.json
	@echo "✓ Clean complete"

uninstall:
	@echo "Uninstalling DMR Web UI from $(INSTALL_DIR)..."
	@rm -rf $(INSTALL_DIR)/dist
	@echo "✓ Uninstalled"

help:
	@echo "DMR Web UI Makefile"
	@echo ""
	@echo "Targets:"
	@echo "  install    - Build and install to ~/.dmr/web/dist"
	@echo "  build      - Build the UI (output to dist/)"
	@echo "  dev        - Start development server (hot reload)"
	@echo "  clean      - Remove build artifacts"
	@echo "  uninstall  - Remove installed UI from ~/.dmr/web/"
	@echo "  help       - Show this help message"
