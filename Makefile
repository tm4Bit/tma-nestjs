.PHONY: help up down build logs shell lint test test-watch start

COMPOSE = docker compose -f docker-compose.dev.yml

help:
	@printf "Targets:\n"
	@printf "  up          Start dev stack (api + mariadb + redis)\n"
	@printf "  down        Stop dev stack\n"
	@printf "  build       Build API image\n"
	@printf "  logs        Follow API logs\n"
	@printf "  shell       Open a shell in API container\n"
	@printf "  start       Start API in watch mode\n"
	@printf "  lint        Run lint inside API container\n"
	@printf "  test        Run tests inside API container\n"
	@printf "  test-watch  Run tests in watch mode inside API container\n"

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down -v

build:
	$(COMPOSE) build api

logs:
	$(COMPOSE) logs -f api

shell:
	$(COMPOSE) exec api sh -lc 'command -v bash >/dev/null 2>&1 && exec bash || exec sh'

start:
	$(COMPOSE) up -d --build
	$(COMPOSE) exec api npm run start:dev

lint:
	$(COMPOSE) exec api npm run lint

format:
	$(COMPOSE) exec api npm run format

test:
	$(COMPOSE) exec api npm run test

test-e2e:
	$(COMPOSE) exec api npm run test:e2e

test-watch:
	$(COMPOSE) exec api npm run test:watch
