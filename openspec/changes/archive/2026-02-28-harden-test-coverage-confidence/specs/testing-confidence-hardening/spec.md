## ADDED Requirements

### Requirement: Critical validation paths SHALL be covered by tests

The system test suite SHALL include explicit coverage for validation edge cases that materially affect write safety and API reliability.

#### Scenario: Update payload rejects invalid empty body

- **WHEN** update requests are validated with an empty object body
- **THEN** tests verify the request fails with a validation error contract

#### Scenario: Update payload rejects invalid null field

- **WHEN** update requests include invalid null values for non-nullable fields
- **THEN** tests verify validation rejects the payload and returns the expected error shape

### Requirement: Critical error-mapping branches SHALL be covered

The system test suite SHALL cover HTTP, validation, database conflict/unavailable, and unexpected error mapping paths to preserve consistent Problem Details behavior.

#### Scenario: Database errors are classified consistently

- **WHEN** representative database errors are passed through global error mapping
- **THEN** tests verify conflict, unavailable, and unknown categories map to expected status/type pairs

#### Scenario: Unexpected error path remains stable

- **WHEN** an unknown non-HTTP exception is raised
- **THEN** tests verify fallback Problem Details payload remains consistent

### Requirement: Runtime wiring smoke paths SHALL be verified

The test suite SHALL include lightweight runtime/wiring checks for application bootstrap and HTTP filter setup.

#### Scenario: HTTP app configuration applies global filters

- **WHEN** application setup code is executed in test context
- **THEN** tests verify expected global filters are registered

### Requirement: Coverage gates SHALL prevent confidence regression

The project SHALL define CI-enforced coverage thresholds to prevent regressions after test hardening is complete.

#### Scenario: Coverage drops below threshold

- **WHEN** test coverage falls below configured minimums
- **THEN** CI fails the pipeline and reports threshold violations
