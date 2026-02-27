## 1. Foundation and contract mapping

- [x] 1.1 Create shared Problem Details mapper (RFC 7807) with deterministic `type` URIs for HTTP, validation, and unexpected errors
- [x] 1.2 Extend mapper with database error categories (constraint conflict, unavailable, unknown) and fallback strategy
- [x] 1.3 Add unit tests for mapper output ensuring required fields (`type`, `title`, `status`, `detail`, `instance`) and safe defaults

## 2. Exception filters implementation

- [x] 2.1 Implement filter for `HttpException` returning `application/problem+json` payloads
- [x] 2.2 Implement validation error filter mapping Zod validation failures to status `400` with `errors` extension
- [x] 2.3 Implement global fallback filter for unexpected exceptions with sanitized `500` response
- [x] 2.4 Implement database error classification for Knex/MariaDB exceptions and integrate with Problem Details response path
- [x] 2.5 Add unit tests for each filter/classifier covering happy path and edge cases

## 3. Application integration and end-to-end verification

- [x] 3.1 Register filters globally in application bootstrap preserving existing serialization/logging flow
- [x] 3.2 Add e2e tests for HTTP exception, validation failure (body/params/query), database conflict (`409`), and database unavailable (`503`) scenarios
- [x] 3.3 Validate Docker dev/prod runtime paths continue healthy (MariaDB + Redis services) while executing error-handling e2e suite
- [x] 3.4 Update developer-facing docs with Problem Details examples for common error categories
