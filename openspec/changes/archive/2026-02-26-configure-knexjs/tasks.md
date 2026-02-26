## 1. Dependencies and Environment

- [x] 1.1 Add Knex.js and MariaDB driver dependencies
- [x] 1.2 Add DB\_\* environment variables to config and validation
- [x] 1.3 Add/update docker-compose dev services for MariaDB + Redis
- [x] 1.4 Add/update Dockerfile and docker-compose prod configuration

## 2. Database Module and Configuration

- [x] 2.1 Create DatabaseModule with Knex provider and lifecycle hooks
- [x] 2.2 Implement Knex configuration builder from DB\_\* env vars
- [x] 2.3 Define migrations and seeds directories for Knex CLI

## 3. Repository Integration

- [x] 3.1 Add repository base pattern using injected Knex
- [x] 3.2 Update sample module/repository to use Knex SQL queries

## 4. Tests

- [x] 4.1 Add unit tests for Knex config builder and env validation
- [x] 4.2 Add integration tests for DatabaseModule lifecycle
- [x] 4.3 Add repository tests verifying Knex query usage
