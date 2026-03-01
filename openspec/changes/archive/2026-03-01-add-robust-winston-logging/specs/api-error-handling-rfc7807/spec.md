## MODIFIED Requirements

### Requirement: API SHALL provide a global fallback for unexpected errors

The system SHALL handle unanticipated exceptions using a global fallback filter and MUST return a sanitized RFC 7807 payload with status `500`. The fallback path MUST emit a structured server-side error log entry that includes error category, request path/method context when available, and stack trace data for diagnostics without exposing sensitive internals in client responses.

#### Scenario: Unhandled runtime error occurs

- **WHEN** an unexpected exception escapes application code
- **THEN** the API responds with status `500`, RFC 7807 fields, and no sensitive internal details

#### Scenario: Unexpected error is logged for diagnostics

- **WHEN** an unexpected exception is handled by the global fallback
- **THEN** the server writes a structured `error` log entry with diagnostic metadata while preserving sanitized client output
