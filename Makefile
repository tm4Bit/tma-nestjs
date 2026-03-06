.PHONY: help up up-ports down down-ports build logs shell lint test test-watch start dbinit verify-dbinit format test-e2e deploy

COMPOSE = docker compose -f docker-compose.dev.yml
COMPOSE_WITH_PORTS = docker compose -f docker-compose.dev.yml -f docker-compose.dev.override.yml
COMPOSE_PROD = docker compose -f docker-compose.prod.yml

help:
	@printf "Targets:\n"
	@printf "  up          Start dev stack (api + mariadb + redis)\n"
	@printf "  up-ports    Start dev stack with DB/Redis host ports exposed\n"
	@printf "  down        Stop dev stack\n"
	@printf "  down-ports  Stop dev stack started with override ports\n"
	@printf "  build       Build API image\n"
	@printf "  logs        Follow API logs\n"
	@printf "  shell       Open a shell in API container\n"
	@printf "  start       Start API in watch mode\n"
	@printf "  dbinit      Recreate MariaDB schema from src/database/schema.sql\n"
	@printf "  verify-dbinit  Verify dbinit happy/failure paths\n"
	@printf "  lint        Run lint inside API container\n"
	@printf "  test        Run tests inside API container\n"
	@printf "  test-watch  Run tests in watch mode inside API container\n"
	@printf "  deploy      Pull latest changes and redeploy production stack\n"

up:
	$(COMPOSE) up -d --build

up-ports:
	$(COMPOSE_WITH_PORTS) up -d --build

down:
	$(COMPOSE) down -v

down-ports:
	$(COMPOSE_WITH_PORTS) down -v

build:
	$(COMPOSE) build api

logs:
	$(COMPOSE) logs -f api

shell:
	$(COMPOSE) exec api sh -lc 'command -v bash >/dev/null 2>&1 && exec bash || exec sh'

start:
	$(COMPOSE) up -d --build
	$(COMPOSE) exec api npm run start:dev

dbinit:
	@test -s src/database/schema.sql || (printf "src/database/schema.sql not found or empty\n" && exit 1)
	$(COMPOSE) up -d mariadb
	$(COMPOSE) exec -T mariadb sh -lc 'mariadb -uroot -p"$$MARIADB_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS \`$$MARIADB_DATABASE\`; CREATE DATABASE \`$$MARIADB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'
	$(COMPOSE) exec -T mariadb sh -lc 'mariadb -uroot -p"$$MARIADB_ROOT_PASSWORD" "$$MARIADB_DATABASE"' < src/database/schema.sql
	@printf "Database initialized from src/database/schema.sql\n"

verify-dbinit:
	bash scripts/verify-dbinit.sh

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

deploy:
	git pull origin master
	$(COMPOSE_PROD) up -d --build
