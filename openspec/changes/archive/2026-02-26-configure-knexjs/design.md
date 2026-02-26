## Context

The Kickstart baseline targets MariaDB with Knex.js as the query builder and mandates a repository layer for data access. We need a consistent, reusable configuration and lifecycle for database connections, aligned with NestJS module boundaries and existing infra requirements (Redis, queues, cache, logging, validation, error handling).

## Goals / Non-Goals

**Goals:**

- Provide a single source of truth for Knex configuration and connection lifecycle.
- Make database access available to repositories across modules in a consistent way.
- Keep configuration environment-driven and aligned with dev/prod parity.
- Enable migrations/seeds workflow without introducing an ORM.

**Non-Goals:**

- Defining application-specific schemas or domain repositories.
- Adding ORM models/entities or automations beyond Knex.
- Changing authentication, cache, queue, or logging implementations.

## Decisions

- **NestJS module wrapper for Knex**: Create a DatabaseModule that provides a Knex instance via dependency injection.
  - _Rationale_: Ensures lifecycle management (init/destroy) and a single configuration source.
  - _Alternatives_: Ad-hoc Knex instantiation per repository (rejected for duplication and connection sprawl).

- **Environment-based configuration**: Use DB\_\* env vars to build the Knex connection.
  - _Rationale_: Aligns with existing infra requirements and supports Docker/local/prod parity.
  - _Alternatives_: Hardcoded config files (rejected for inflexibility).

- **Repository pattern via injected Knex**: Repositories receive Knex instance and compose SQL queries directly.
  - _Rationale_: Meets architecture standards and keeps SQL explicit.
  - _Alternatives_: Query helpers without DI (rejected for testability and consistency).

- **Migration/seed scripts via Knex CLI**: Provide configuration and folder conventions without enforcing behavior.
  - _Rationale_: Supports structured schema evolution without ORM.
  - _Alternatives_: Custom migration runner (defer unless necessary).

## Risks / Trade-offs

- **Risk**: Misconfigured environment variables cause runtime connection failures.
  - **Mitigation**: Validate env at startup and provide clear error messages.
- **Risk**: Multiple Knex instances created inadvertently.
  - **Mitigation**: Centralize in DatabaseModule and avoid local instantiation.
- **Trade-off**: Direct SQL offers flexibility but requires stronger test coverage.
  - **Mitigation**: Enforce repository-level unit/e2e tests as standard.
