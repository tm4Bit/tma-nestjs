## Context

The project already uses Docker for dev/prod, but the configuration needs to reflect the desired deployment model: the API always runs in a container, while production dependencies (MariaDB, Redis, etc.) are managed externally. Dev should provide a full local stack (API + DB + Redis) for convenience.

## Goals / Non-Goals

**Goals:**

- Provide distinct Docker Compose configurations for dev and prod.
- Ensure the API container is the primary runtime in both environments.
- Make production Docker run only the API and connect to external services via env vars.

**Non-Goals:**

- Introducing Kubernetes or advanced orchestration.
- Changing application code unrelated to Docker.
- Defining production infrastructure for databases/Redis.

## Decisions

- **Separate Compose files**: `docker-compose.dev.yml` for local stack and `docker-compose.prod.yml` for API-only.
  - _Rationale_: Keeps environment assumptions explicit and reduces accidental prod coupling.
  - _Alternatives_: Single compose with profiles (defer for simplicity).

- **API container as the only prod service**: Prod Compose runs only the API container.
  - _Rationale_: Aligns with externalized dependencies and deployment constraints.
  - _Alternatives_: Bundling DB/Redis in prod (rejected).

- **Environment-driven endpoints**: DB/Redis host/ports always injected via env vars.
  - _Rationale_: Supports external services and easy configuration.
  - _Alternatives_: Hardcoded network names (rejected).

## Risks / Trade-offs

- **Risk**: Misconfigured env vars in prod cause startup failures.
  - **Mitigation**: Document required env vars and validation.
- **Trade-off**: Two compose files increase maintenance.
  - **Mitigation**: Keep them minimal and aligned with shared Dockerfile.

## Migration Plan

- Add new compose files and Dockerfile adjustments.
- Update README or docs with dev/prod usage.
- Verify dev stack boots and prod compose runs API-only.

## Open Questions

- Should prod compose include optional healthcheck or wait-for scripts?
