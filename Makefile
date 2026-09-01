# CipherNest — Task runner
.PHONY: setup install dev dev-api dev-all electron build docker-honeypot clean help

help:  ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?##"}{printf "  \033[36m%-18s\033[0m %s\n",$$1,$$2}'

setup:  ## First-time setup (deps + .env + Docker image)
	@bash setup.sh

install:  ## Install all dependencies
	pip3 install -r backend/requirements.txt
	npm install

dev-api:  ## Run Python FastAPI + SSH + Beacon only
	python3 backend/main.py

dev:  ## Run Next.js frontend only
	npx next dev

dev-all:  ## Run everything in dev mode (API + frontend)
	npm run dev:all

electron:  ## Launch Electron desktop app
	npm run electron

build:  ## Build Next.js for production
	npx next build

docker-honeypot:  ## Build & start honeypot containers
	docker build -f docker/Dockerfile.honeypot -t ciphernest-honeypot-01 docker/
	docker compose -f docker/docker-compose.honeypot.yml up -d

clean:  ## Remove build artifacts
	rm -rf .next node_modules/__pycache__
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
