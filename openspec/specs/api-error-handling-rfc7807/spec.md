## ADDED Requirements

### Requirement: API SHALL return RFC 7807 problem details for HTTP exceptions

The system SHALL return error responses in `application/problem+json` format for handled `HttpException` cases. Each response MUST include `type`, `title`, `status`, `detail`, and `instance`.

#### Scenario: Handled HTTP exception is mapped to problem details

- **WHEN** an endpoint raises a NestJS `HttpException`
- **THEN** the response uses `application/problem+json` and includes `type`, `title`, `status`, `detail`, and `instance`

### Requirement: API SHALL return structured validation problems

The system SHALL map validation failures to `400 Bad Request` using RFC 7807 fields and MUST include an `errors` extension with field-level validation details.

#### Scenario: Body validation fails

- **WHEN** request body validation fails before controller execution
- **THEN** the API returns status `400` with RFC 7807 base fields and an `errors` extension containing invalid fields and messages

#### Scenario: Params or query validation fails

- **WHEN** params or query validation fails
- **THEN** the API returns status `400` in the same RFC 7807 structure used for body validation

### Requirement: API SHALL provide a global fallback for unexpected errors

The system SHALL handle unanticipated exceptions using a global fallback filter and MUST return a sanitized RFC 7807 payload with status `500`. The fallback path MUST emit a structured server-side error log entry that includes error category, request path/method context when available, and stack trace data for diagnostics without exposing sensitive internals in client responses.

#### Scenario: Unhandled runtime error occurs

- **WHEN** an unexpected exception escapes application code
- **THEN** the API responds with status `500`, RFC 7807 fields, and no sensitive internal details

#### Scenario: Unexpected error is logged for diagnostics

- **WHEN** an unexpected exception is handled by the global fallback
- **THEN** the server writes a structured `error` log entry with diagnostic metadata while preserving sanitized client output

### Requirement: Problem type identifiers SHALL be stable per error category

The system SHALL define deterministic `type` URIs for major error categories (HTTP exception, validation error, unexpected error) so clients can classify failures reliably.

#### Scenario: Same error category occurs across endpoints

- **WHEN** two different endpoints produce the same category of error
- **THEN** both responses use the same `type` URI for that category
