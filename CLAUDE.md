# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run inside the Docker API container. Start the dev stack first with `make up`.

```bash
make up           # Start dev stack (API + MariaDB + Redis)
make down         # Stop dev stack
make lint         # Run ESLint with auto-fix
make test         # Run unit tests
make test-e2e     # Run e2e tests
make test-watch   # Run unit tests in watch mode
make shell        # Open shell in API container
make dbinit       # Recreate DB schema from src/database/schema.sql (destructive)
```

To run a single test file inside the container:
```bash
docker compose -f docker-compose.dev.yml exec api npx jest path/to/file.spec.ts
```

To run e2e tests with real DB integration:
```bash
RUN_DB_INTEGRATION_TESTS=1 npm run test:e2e
```

Coverage thresholds are enforced (branches: 70%, functions: 90%, lines: 85%).

## Architecture

### Request lifecycle

```
HTTP Request
  → ZodValidationPipe (validates + parses request body/query/params via Zod schema)
  → Controller (maps HTTP DTO → domain input via mapper functions)
  → Service (business logic, throws NestJS HTTP exceptions on not-found / invariant failures)
  → Repository (Knex queries against MariaDB; returns domain types or null)
  → Controller (maps domain type → HTTP response DTO via mapper functions)
  → ZodSerializerInterceptor (strips unknown fields using ZodResponse schema)
  → Response
```

Exception filters in `src/bootstrap/configure-http-app.ts` convert all thrown exceptions to RFC 7807 Problem Details (`application/problem+json`). Three filters are registered in order: `ZodValidationProblemDetailsFilter`, `HttpProblemDetailsFilter`, `GlobalProblemDetailsFilter`.

### Layered separation pattern

Each feature module (e.g., `blog-posts`) maintains strict layer separation:

| File | Purpose |
|------|---------|
| `*.domain.types.ts` | Pure TypeScript types for domain objects and service inputs — no framework dependencies |
| `*.http.schemas.ts` | Zod schemas for HTTP contracts (request bodies, query params, response shapes) |
| `*.http.dto.ts` | `createZodDto()` wrappers that make Zod schemas usable as NestJS DTOs |
| `*.mapper.ts` | Pure functions converting between HTTP DTOs and domain types |
| `*.service.ts` | Business logic; depends only on repository and domain types |
| `*.repository.ts` | Knex queries; extends abstract `Repository` class from `src/database/repository.ts` |
| `*.module.ts` | NestJS module wiring |

### Validation and serialization

- **Input validation**: `ZodValidationPipe` (global, registered via `APP_PIPE`) validates all `@Body`, `@Query`, `@Param` decorated with a `createZodDto()` class.
- **Response serialization**: `ZodSerializerInterceptor` (global, registered via `APP_INTERCEPTOR`) strips unknown fields. Controllers annotate responses with `@ZodResponse({ status, type: SomeDto })`.
- **OpenAPI docs**: `@ZodResponse` also generates Swagger schema. `cleanupOpenApiDoc` is called at startup to normalize the generated spec. See `src/docs/openapi-response-contracts.spec.ts` for a unit test that asserts Swagger schemas are correctly generated per endpoint.

### Database

- Knex is the query builder (no ORM). The `KNEX_CONNECTION` symbol is used for injection.
- `DatabaseModule` is `@Global()` so `KNEX_CONNECTION` is available everywhere without re-importing.
- `src/database/schema.sql` is the single source of truth for the dev schema. Run `make dbinit` to apply it (drops and recreates the database).
- DB column names use `snake_case`; domain types use `camelCase`. Aliasing happens in repository `select()` calls (e.g., `published_at as publishedAt`).

### Error handling

- `src/errors/problem-details.ts`: defines `PROBLEM_TYPE` URIs, the `ProblemDetails` type, and `createProblemDetails()` factory.
- `src/errors/problem-details.mapper.ts`: builds problem payloads from exceptions (validation, HTTP, database, unexpected).
- `src/errors/problem-details.filters.ts`: three `ExceptionFilter` classes that catch and send problem responses.
- DB errors are classified as `conflict` (duplicate key → 409), `unavailable` (connection error → 503), or `unknown` (falls through to 500).
- In `development` mode, unexpected errors include a `caused_by` field with the stack trace.

### Environment and config

- `src/config/env.ts`: single `getEnv()` function that parses and caches `process.env` through a Zod schema. All env access must go through `getEnv()`.
- Required env vars: `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `REDIS_HOST`. All others have defaults.

### Logging

- Winston + `nest-winston` provide structured logging. The `WinstonModule` is imported in `LoggingModule`, which is the first import in `AppModule`.
- Every request gets a `correlationId` (from `X-Request-Id` header or auto-generated UUID) attached via `correlationIdMiddleware`.
- Unhandled exceptions are logged with event `unhandled_exception` including method, path, correlationId, and error details.

## Definition of done

A task is only complete when all of the following pass without errors:

```bash
make lint         # No linting errors
make test         # All unit tests pass (coverage thresholds met)
make test-e2e     # All e2e tests pass
```

### Testing conventions

- Unit tests live alongside source files (`*.spec.ts`); e2e tests live in `test/` (`*.e2e-spec.ts`).
- Unit tests focus on deterministic branch behavior (service/repository semantics, mapper/filter branches).
- E2e tests focus on request boundary and error-surface behavior (RFC 7807 response shapes, HTTP status codes).
- Repositories are stubbed in unit/e2e tests using `useValue` with explicit `jest.fn()` per method.
- `src/docs/openapi-response-contracts.spec.ts` is a unit-style test that verifies Swagger schema generation for each endpoint.
