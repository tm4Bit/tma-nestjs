## ADDED Requirements

### Requirement: Knex configuration uses environment variables

The system SHALL construct the Knex MariaDB connection configuration exclusively from DB\_\* environment variables.

#### Scenario: Valid environment configuration

- **WHEN** DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD are provided
- **THEN** the system creates a Knex connection using those values

### Requirement: Database module provides a shared Knex instance

The system SHALL expose a single Knex instance via a dedicated DatabaseModule for dependency injection.

#### Scenario: Repository requests database access

- **WHEN** a repository is instantiated by NestJS
- **THEN** it receives the shared Knex instance from the DatabaseModule

### Requirement: Connection lifecycle is managed by the module

The system MUST initialize the Knex connection on module startup and destroy it on application shutdown.

#### Scenario: Application shutdown

- **WHEN** the application is terminated gracefully
- **THEN** the Knex connection is destroyed

### Requirement: Repositories use Knex for SQL queries

Repositories SHALL execute SQL queries through the injected Knex instance without ORM abstractions.

#### Scenario: Repository performs data access

- **WHEN** a repository executes a query
- **THEN** it uses the injected Knex instance to build and run SQL

### Requirement: Migration and seed configuration is defined

The system SHALL define standard locations for Knex migrations and seeds to support schema evolution.

#### Scenario: Running migrations

- **WHEN** the migration runner is invoked
- **THEN** it reads migrations from the configured migrations directory
