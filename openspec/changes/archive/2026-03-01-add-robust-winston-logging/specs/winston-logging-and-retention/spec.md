## ADDED Requirements

### Requirement: Application SHALL use Winston as the unified NestJS logger

The system SHALL configure NestJS logging through `nest-winston` so framework and application logs use a shared Winston pipeline.

#### Scenario: Bootstrap logger wiring

- **WHEN** the application starts
- **THEN** NestJS uses the configured Winston logger for framework and application log events

### Requirement: Production logs SHALL be rotated and retention-bounded

In production, the system SHALL write logs to `winston-daily-rotate-file` transports with explicit retention and size constraints to prevent unbounded storage growth.

#### Scenario: Daily rotation in production

- **WHEN** production logs cross a rotation boundary defined by date pattern
- **THEN** a new log file is created and older files are retained only within configured limits

#### Scenario: Retention enforcement in production

- **WHEN** retained production log files exceed configured `maxFiles` or `maxSize` policy
- **THEN** the oldest eligible files are removed according to rotation policy

#### Scenario: Production rotated logs are compressed by default

- **WHEN** rotating file transports are initialized in production without explicit archive override
- **THEN** rotated log archives are compressed (`zippedArchive=true`)

### Requirement: Development logging SHALL persist only error logs to file

In development, the system SHALL keep non-error logs in console output and SHALL persist only `error` level entries to a rotating file transport.

#### Scenario: Development info log

- **WHEN** an `info` level event is emitted in development
- **THEN** it is visible in console output and not written to the error file transport

#### Scenario: Development error log

- **WHEN** an `error` level event is emitted in development
- **THEN** it is visible in console output and written to the error rotating file transport

### Requirement: Logging policy SHALL be environment-configurable

The system SHALL expose log policy settings through environment variables, including log directory, base level, rotation date pattern, maximum file size, and retention window.

#### Scenario: Environment policy override

- **WHEN** deployment provides explicit logging environment variables
- **THEN** logger transports honor those values without code changes

### Requirement: Request-scoped logs SHALL include a correlation identifier

The system SHALL ensure each HTTP request has a correlation identifier used across structured logs for that request. If the incoming request provides `X-Request-Id`, the system MUST reuse it; otherwise, the system MUST generate one.

#### Scenario: Incoming request id is reused

- **WHEN** an HTTP request includes header `X-Request-Id`
- **THEN** logs generated for that request include the same value as `correlationId`

#### Scenario: Correlation id is generated when missing

- **WHEN** an HTTP request does not include `X-Request-Id`
- **THEN** the system generates a correlation identifier and includes it as `correlationId` in request-scoped logs

#### Scenario: Error logs carry correlation id

- **WHEN** an exception is handled in request scope
- **THEN** the emitted structured `error` log entry includes the request `correlationId`
