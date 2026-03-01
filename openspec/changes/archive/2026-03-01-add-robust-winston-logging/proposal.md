## Why

Production troubleshooting is currently harder than it should be because logs are not retained in a structured, rotated, and searchable way. We need durable error logs with predictable retention so incidents can be diagnosed quickly without uncontrolled disk growth.

## What Changes

- Add a centralized Winston-based logging system integrated with NestJS through `nest-winston`.
- Configure environment-aware transports:
  - Production: structured file logging with daily rotation/retention and console output.
  - Development: keep console-first behavior, but persist only `error` level logs to file.
- Define consistent log format fields (timestamp, level, context, message, stack, correlationId) and propagate correlation IDs per request.
- Add rotation and retention policies using `winston-daily-rotate-file` to cap storage growth.
- Expose configurable log behavior via environment variables (level, max files, max size, log directory, date pattern).

## Capabilities

### New Capabilities

- `winston-logging-and-retention`: Configure robust NestJS logging with environment-specific transports, structured output, and bounded file retention.

### Modified Capabilities

- `api-error-handling-rfc7807`: Ensure global error handling and logging integration preserve standardized Problem Details behavior while improving production diagnostics.

## Impact

- Affected code: bootstrap/configuration wiring, logging module/provider setup, global exception handling integration, and environment config.
- Dependencies: add and configure `winston`, `nest-winston`, and `winston-daily-rotate-file`.
- Operations: introduces log directory management and explicit retention policies for production safety.
