## 1. SQL dump foundation

- [x] 1.1 Add canonical `schema.sql` file and define repository location/ownership rules
- [x] 1.2 Remove or deprecate Knex migration/seed workflow references from runtime setup (without breaking Knex query usage)
- [x] 1.3 Add tests/checks that fail clearly when `schema.sql` is missing or empty for DB provisioning commands

## 2. Database commands and automation

- [x] 2.1 Add `make dbinit` command to recreate local MariaDB database and apply `schema.sql`
- [x] 2.2 Ensure `dbinit` runs through Docker dev services and honor env vars (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
- [x] 2.3 Add command-level tests or scripted verification for `dbinit` happy path and failure path

## 3. Documentation and rollout

- [x] 3.1 Update README/DevEx docs with simplified dump-based workflow (`schema.sql` + `make dbinit`)
- [x] 3.2 Document expected workflow when production schema changes (replace dump and rerun `make dbinit`, always full recreate)
- [x] 3.3 Run lint, unit tests, and e2e tests to verify no regression in Knex-based query runtime
