## ADDED Requirements

### Requirement: Dev Docker runs full local stack

The system SHALL provide a dev Docker Compose configuration that runs the API plus MariaDB and Redis locally.

#### Scenario: Starting dev environment

- **WHEN** the developer runs the dev compose configuration
- **THEN** the API, MariaDB, and Redis containers start together

### Requirement: Prod Docker runs API only

The system SHALL provide a production Docker Compose configuration that runs only the API container.

#### Scenario: Starting prod environment

- **WHEN** the operator runs the prod compose configuration
- **THEN** only the API container starts

### Requirement: External services are configured via env vars

The API container MUST read database and Redis connection information from environment variables in production.

#### Scenario: Connecting to external services

- **WHEN** DB*\* and REDIS*\* variables are provided in prod
- **THEN** the API connects to the external database and Redis instances
