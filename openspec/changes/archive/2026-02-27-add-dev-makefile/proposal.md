## Why

Running common dev commands inside the Docker API container is verbose and inconsistent. A Makefile will centralize those commands, reduce friction, and keep the team using the containerized workflow.

## What Changes

- Add a Makefile with targets for common development actions (lint, test, start, logs, shell, docker compose helpers) that run inside the API container.
- Document the expected container-first workflow for these targets.

## Capabilities

### New Capabilities

- `dev-makefile`: Standardized Makefile targets for container-first development workflows.

### Modified Capabilities

- _None._

## Impact

- Add `Makefile` at repository root.
- Developer workflow documentation (README or similar) if needed.
- No runtime changes to application code.
