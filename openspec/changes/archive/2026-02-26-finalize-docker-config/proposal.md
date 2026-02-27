## Why

We need clear, production-accurate Docker configuration for dev and prod so the API always runs inside a container. In production, only the API should run in Docker while dependencies (DB/Redis/etc.) are managed externally.

## What Changes

- Define separate Docker setups for dev and prod, aligned with the desired deployment model.
- Ensure the API container runs consistently in both environments.
- Configure prod to connect to external services instead of running DB/Redis containers.

## Capabilities

### New Capabilities

- `docker-environments`: Docker configuration for dev and prod with API-container-first workflow.

### Modified Capabilities

- _None._

## Impact

- Docker Compose files and Dockerfile(s).
- Environment variable documentation for external services in production.
