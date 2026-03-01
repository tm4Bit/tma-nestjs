## Context

The project already enforces a global RFC 7807 error surface and relies on Docker-based dev/prod environments. Logging is currently not standardized for long-lived production diagnostics, and there is no explicit retention strategy to prevent unbounded growth.

This change introduces `winston`, `nest-winston`, and `winston-daily-rotate-file` as the canonical logging stack. The design must preserve existing API behavior while improving observability, especially for production incidents where stack traces and execution context are needed for root-cause analysis.

## Goals / Non-Goals

**Goals:**

- Provide a single NestJS logger integration path for application and framework logs.
- Ensure production logs are written to rotating files with explicit retention and size limits.
- Keep developer ergonomics: in development, non-error logs remain console-first while only `error` logs are persisted to file.
- Preserve RFC 7807 response behavior and enrich server-side error diagnostics without leaking sensitive details to clients.
- Make logging behavior configurable through environment variables.

**Non-Goals:**

- Building a full centralized log shipping pipeline (ELK/OpenSearch/Loki) in this change.
- Changing API response contracts beyond what is already defined by RFC 7807 specs.
- Introducing database-backed log persistence.

## Decisions

1. **Adopt `nest-winston` as the Nest logger adapter.**
   - Rationale: aligns Nest internal/system logs and app logs under one transport configuration.
   - Alternative considered: custom `LoggerService` wrapper around raw Winston. Rejected for higher maintenance and duplicated integration logic.

2. **Use `winston-daily-rotate-file` for production file transports.**
   - Rationale: built-in date-based rotation and retention (`maxFiles`) directly address storage growth risk.
   - Alternative considered: external `logrotate` only. Rejected because application-level policy should be portable across containerized environments.

3. **Define environment-specific transport strategy.**
   - Production: console + rotating file transports for `error` and combined non-error application logs with structured JSON format.
   - Development: console transport for normal workflow and a rotating file transport restricted to `error` level.
   - Rationale: production needs durability and forensic history; development prioritizes fast feedback with minimal disk noise.

4. **Preserve global exception behavior and couple it with structured server-side error logging.**
   - Rationale: API clients keep stable RFC 7807 contract while operators gain richer diagnostics.
   - Alternative considered: response enrichment with internal debugging fields. Rejected to avoid leaking sensitive implementation details.

5. **Centralize log settings under env-driven config.**
   - Proposed variables: `LOG_DIR`, `LOG_LEVEL`, `LOG_MAX_FILES`, `LOG_MAX_SIZE`, `LOG_DATE_PATTERN`, `LOG_ZIPPED_ARCHIVE`.
   - Default policy: in production, `LOG_ZIPPED_ARCHIVE` defaults to enabled (`true`) for rotated files; in non-production it defaults to disabled unless explicitly overridden.
   - Rationale: enables ops tuning without code changes across environments.

6. **Adopt request correlation ID propagation for all request-scoped logs.**
   - Strategy: honor inbound `X-Request-Id` when present, otherwise generate a UUID at request entry and propagate it through request context.
   - Logging behavior: include `correlationId` in structured logs emitted from request lifecycle and global exception handling.
   - Rationale: enables fast traceability of a single request across controller/service/repository/error logs during production incidents.

## Risks / Trade-offs

- [Risk] Misconfigured retention values can still cause high disk usage in production. → Mitigation: enforce conservative defaults and document expected volume.
- [Risk] JSON logs may be less readable for developers in local workflows. → Mitigation: keep human-readable console format in development while file logs remain structured.
- [Risk] Logger wiring changes can regress bootstrap/error paths. → Mitigation: add targeted unit/e2e tests for startup logger registration and exception-to-log integration.
- [Risk] Extra file I/O may affect high-throughput scenarios. → Mitigation: keep rotation limits strict and isolate error transport in development.

## Migration Plan

1. Add dependencies and logging configuration module/factory.
2. Wire `nest-winston` at bootstrap level so Nest internals and app logs share the same logger.
3. Update global exception handling path to emit structured error logs while preserving RFC 7807 responses.
4. Add/adjust tests for logger transport behavior and error logging integration.
5. Roll out with environment variables in production manifests and monitor log volume for one release cycle.

Rollback strategy:

- Revert bootstrap logger binding to previous Nest logger setup.
- Disable file transports via env toggles if immediate rollback of code is not feasible.

## Open Questions
