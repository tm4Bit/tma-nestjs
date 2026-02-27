## Context

Development commands currently require long Docker Compose invocations, which increases friction and leads to inconsistency in how developers run tasks inside the API container. The project already uses Docker for dev and expects a container-first workflow.

## Goals / Non-Goals

**Goals:**

- Provide a Makefile with standard targets that run inside the API container.
- Keep the Docker Compose file as the single source of truth for container configuration.
- Ensure targets are easy to discover and consistent across the team.

**Non-Goals:**

- Replacing Docker Compose or changing container topology.
- Introducing new runtime dependencies.
- Creating new application features beyond developer tooling.

## Decisions

- **Use Makefile targets that call Docker Compose exec** to run commands inside the API container.
  - _Rationale_: Keeps the workflow aligned with container-first development while hiding verbose commands.
  - _Alternatives_: Shell scripts or npm scripts (less discoverable for container-based operations).

- **Provide a small set of core targets** (lint, test, test-watch, logs, shell, up, down, build).
  - _Rationale_: Covers the common workflows without overloading the Makefile.
  - _Alternatives_: Large target list with niche commands (rejected for simplicity).

## Risks / Trade-offs

- **Risk**: Differences in local Docker setup could cause target failures.
  - **Mitigation**: Document prerequisites and keep targets minimal.

- **Trade-off**: Make is an extra tool to learn.
  - **Mitigation**: Use clear target names and add a help target.
