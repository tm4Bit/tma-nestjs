## 1. Dependency and configuration foundation

- [x] 1.1 Add `winston`, `nest-winston`, and `winston-daily-rotate-file` dependencies and verify lockfile updates
- [x] 1.2 Extend environment configuration/validation with logging settings (`LOG_DIR`, `LOG_LEVEL`, `LOG_MAX_FILES`, `LOG_MAX_SIZE`, `LOG_DATE_PATTERN`, `LOG_ZIPPED_ARCHIVE`) and sensible defaults per environment
- [x] 1.3 Add unit tests for environment parsing/validation of logging configuration

## 2. Logger wiring and transport strategy

- [x] 2.1 Implement centralized Winston logger factory with structured format and environment-aware transports
- [x] 2.2 Wire `nest-winston` into bootstrap so Nest framework logs and app logs share the same logger pipeline
- [x] 2.3 Implement production rotating file transports with bounded retention/size and development error-only file transport
- [x] 2.4 Implement correlation ID propagation (reuse `X-Request-Id` or generate) and include `correlationId` in request-scoped logs
- [x] 2.5 Add unit tests for transport selection, correlation ID propagation, and level behavior in development vs production

## 3. Error-path diagnostic integration

- [x] 3.1 Update global fallback error handling path to emit structured diagnostic error logs while keeping RFC 7807 response shape unchanged
- [x] 3.2 Add/expand tests for fallback error behavior to verify both sanitized client response and server-side error logging expectations

## 4. Container/runtime and operational hardening

- [x] 4.1 Ensure Docker dev/prod configurations expose writable log directory behavior aligned with rotation policy
- [x] 4.2 Document recommended retention defaults and disk-usage guidance for production operations
- [x] 4.3 Add smoke/integration verification that rotated files are created and retained according to policy in production-like settings

## 5. Regression validation

- [x] 5.1 Run `make lint`, `make test`, and `make test-e2e` and resolve regressions
- [x] 5.2 Run `npm run test:cov` and confirm coverage gates still pass after logging changes
