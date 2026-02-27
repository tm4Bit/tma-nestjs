## ADDED Requirements

### Requirement: API SHALL map database errors to RFC 7807 problem details

The system SHALL convert database errors originating from Knex/MariaDB into `application/problem+json` responses with `type`, `title`, `status`, `detail`, and `instance`.

#### Scenario: Repository throws database error

- **WHEN** a repository operation raises a database-level exception
- **THEN** the response follows RFC 7807 with stable category-specific `type` and sanitized `detail`

### Requirement: API SHALL classify unique or key constraint violations as conflict

The system SHALL map known unique/key constraint violations to `409 Conflict` with a deterministic conflict `type` URI.

#### Scenario: Duplicate key on create or update

- **WHEN** an insert or update violates a unique/key constraint
- **THEN** the API returns `409` Problem Details with a conflict `type` URI and non-sensitive `detail`

### Requirement: API SHALL classify transient database availability failures

The system SHALL map connection timeout, refused connection, or temporary database unavailability errors to `503 Service Unavailable`.

#### Scenario: Database is unavailable

- **WHEN** the application cannot reach MariaDB due to timeout or connection failure
- **THEN** the API returns `503` Problem Details with a service-unavailable `type` URI

### Requirement: API SHALL fallback safely for unknown database errors

The system SHALL return a sanitized `500` Problem Details response when database errors do not match known mappings.

#### Scenario: Unclassified database driver error

- **WHEN** an unknown database error is raised by the driver
- **THEN** the API returns `500` Problem Details without exposing SQL statements, table names, or stack traces
