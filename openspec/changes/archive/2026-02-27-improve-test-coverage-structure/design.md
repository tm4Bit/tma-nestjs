## Context

The project follows a layered NestJS architecture (controller, service, repository) and uses TDD as a default practice. Existing blog posts unit tests pass, but they are not consistently grouped by action, which reduces readability and makes it harder to verify complete scenario coverage per endpoint/use case.

This change is test-only and must preserve runtime behavior. No data model, API contract, queue, cache, auth, logging, cron, or error-shape changes are intended.

## Goals / Non-Goals

**Goals:**

- Standardize test suite structure so each action has a dedicated `describe` block in controller, service, and repository specs.
- Improve scenario coverage per action, including success paths and relevant failure/not-found paths.
- Keep tests deterministic, isolated, and aligned with current module contracts.

**Non-Goals:**

- Refactor production implementation for new behavior.
- Introduce new frameworks, test runners, or assertion libraries.
- Change Redis/BullMQ, cache behavior, scheduling, logging, validation strategy, serialization, or global error handling.

## Decisions

### Decision: Organize by action-first hierarchy in each spec file

Tests will be grouped by action (`create`, `list/index`, `show/findById`, `update`, `delete/destroy`) using one top-level `describe` per action inside each file. This matches the project architectural pattern and improves navigability.

Alternative considered:

- Keep mixed or lifecycle-based grouping (rejected because it hides action-level gaps).

### Decision: Expand only missing action-level scenarios

Coverage increases will target missing scenarios without rewriting all existing tests. This minimizes churn and keeps review focused.

Alternative considered:

- Full test rewrite (rejected due to unnecessary risk and larger diff).

### Decision: Preserve current runtime contracts and cross-cutting concerns

Assertions will validate existing contracts only. No changes will be made to authentication, cache, queue, logging, cron, serialization, or error format.

Alternative considered:

- Combining contract changes with test improvements (rejected; not required for this goal).

## Risks / Trade-offs

- [Risk] More verbose test files after grouping by action. -> Mitigation: Use concise setup helpers and shared fixtures where appropriate.
- [Risk] Added tests may become coupled to implementation details. -> Mitigation: Assert observable behavior (inputs/outputs/interactions), not internals.
- [Risk] Inconsistent action naming across layers (`show` vs `findById`, `destroy` vs `delete`). -> Mitigation: Use layer-appropriate names but keep one action-to-describe mapping documented in each file.
