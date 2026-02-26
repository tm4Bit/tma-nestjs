## Why

We need a consistent, production-ready Knex.js setup to access MariaDB without ORM abstractions. This change unblocks repository-based data access, shared configuration, and local/prod parity now that the Kickstart baseline is being established.

## What Changes

- Add a standardized Knex.js configuration and connection lifecycle for MariaDB.
- Provide a shared database module and repository integration pattern.
- Define environment variables and defaults for database connectivity.
- Include guidance for migrations/seeds organization (without enforcing an ORM).

## Capabilities

### New Capabilities

- `database-knex`: Knex.js configuration, connection management, and repository integration for MariaDB.

### Modified Capabilities

- _None._

## Impact

- Backend bootstrap/configuration, database connectivity, and repository layer setup.
- Environment variables for database connection.
- Developer workflow for migrations/seeds (if applicable).
