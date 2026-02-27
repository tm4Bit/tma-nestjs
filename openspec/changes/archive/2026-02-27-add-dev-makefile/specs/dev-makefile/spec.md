## ADDED Requirements

### Requirement: Makefile provides container-first dev targets

The system SHALL provide a Makefile with standard targets that execute development commands inside the API container using the dev Docker Compose configuration.

#### Scenario: Running lint inside the container

- **WHEN** the developer runs the Makefile lint target
- **THEN** lint executes inside the API container via the dev compose configuration

#### Scenario: Running tests inside the container

- **WHEN** the developer runs the Makefile test target
- **THEN** the test suite executes inside the API container via the dev compose configuration

#### Scenario: Opening a shell inside the container

- **WHEN** the developer runs the Makefile shell target
- **THEN** an interactive shell is opened inside the API container
