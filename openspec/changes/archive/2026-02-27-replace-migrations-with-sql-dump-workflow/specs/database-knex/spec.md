## MODIFIED Requirements

### Requirement: Migration and seed configuration is defined

The system SHALL define `schema.sql` as the canonical schema source for development database provisioning instead of relying on Knex migrations/seeds.

#### Scenario: Initializing local database from dump

- **WHEN** the database initialization command is invoked
- **THEN** the system applies `schema.sql` to provision the MariaDB schema for development

## ADDED Requirements

### Requirement: Database provisioning commands SHALL be available in Makefile

The system SHALL provide a Makefile command to initialize the development database schema from the SQL dump workflow by recreating the database.

#### Scenario: Full local rebuild

- **WHEN** the developer runs `make dbinit`
- **THEN** the development database is recreated and `schema.sql` is applied

#### Scenario: Applying schema changes in development

- **WHEN** the developer replaces `schema.sql` with a newer production dump and runs `make dbinit`
- **THEN** the development database is recreated and provisioned entirely from the updated `schema.sql`

### Requirement: Runtime data access SHALL remain Knex-based without migrations

The system SHALL continue using Knex for connection management and query execution while schema evolution in development is handled via SQL dump commands.

#### Scenario: Repository query execution after dump-based setup

- **WHEN** the application executes repository operations after `dbinit`
- **THEN** repositories use Knex queries normally without requiring Knex migration execution
