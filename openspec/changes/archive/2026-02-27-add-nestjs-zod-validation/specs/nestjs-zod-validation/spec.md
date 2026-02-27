## ADDED Requirements

### Requirement: Validate request body with nestjs-zod

The system SHALL validate request bodies using `nestjs-zod` schemas for create/update endpoints.

#### Scenario: Body validation fails

- **WHEN** a request body does not satisfy the Zod schema
- **THEN** the system returns a validation error response

### Requirement: Validate query params with nestjs-zod

The system SHALL validate query parameters using `nestjs-zod` schemas for list endpoints.

#### Scenario: Query validation fails

- **WHEN** query parameters do not satisfy the Zod schema
- **THEN** the system returns a validation error response

### Requirement: Validate path params with nestjs-zod

The system SHALL validate path parameters using `nestjs-zod` schemas for endpoints that accept ids.

#### Scenario: Params validation fails

- **WHEN** a path parameter does not satisfy the Zod schema
- **THEN** the system returns a validation error response
