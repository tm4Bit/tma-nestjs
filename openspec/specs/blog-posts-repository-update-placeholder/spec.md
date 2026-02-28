## ADDED Requirements

### Requirement: Blog post repository update SHALL forward validated input directly to Knex

The blog post repository update operation SHALL pass the received update input object directly to Knex `update(...)` without local field filtering or empty-payload fallback logic.

#### Scenario: Direct update payload pass-through

- **WHEN** the repository update method is called with a validated payload
- **THEN** the method calls Knex `update(...)` using that same payload object

### Requirement: Update result SHALL depend on affected row count

The repository update operation SHALL return `null` when Knex reports zero affected rows, and SHALL return the updated blog post by id when one or more rows are affected.

#### Scenario: Missing row update

- **WHEN** Knex update reports `0` affected rows
- **THEN** the repository returns `null`

#### Scenario: Successful update

- **WHEN** Knex update reports one or more affected rows
- **THEN** the repository fetches and returns the updated blog post by id

### Requirement: Unit tests SHALL reflect simplified placeholder behavior

Repository unit tests SHALL verify direct payload pass-through and SHALL not expect empty-object fallback behavior in the update method.

#### Scenario: Test contract alignment

- **WHEN** repository update unit tests are executed
- **THEN** they validate direct update payload forwarding and affected-row result handling
