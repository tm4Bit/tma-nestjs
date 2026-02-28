## Context

The current test baseline is stable and valuable (unit + e2e passing), but confidence is uneven across high-risk branches and runtime wiring paths. Recent exploration highlighted gaps around validation edge cases, error mapping/filter branches, bootstrap wiring smoke coverage, and sustained governance to prevent coverage regression.

This is a cross-cutting quality change across blog-posts, error handling, bootstrap/runtime wiring, and CI governance.

## Goals / Non-Goals

**Goals:**

- Raise confidence for refactoring and feature development by strengthening branch and contract coverage in critical areas.
- Add targeted tests where risk is highest (validation, repository update semantics, global error mapping, e2e negative paths).
- Introduce coverage quality gates in CI to make confidence durable.

**Non-Goals:**

- Changing business behavior, API contract semantics, or persistence model.
- Rewriting the entire existing test suite.
- Introducing new runtime dependencies.

## Decisions

### Decision: Phase the hardening by risk

Implementation proceeds in four phases: (1) validation/contracts, (2) error-surface hardening, (3) runtime/wiring safety nets, (4) governance gates.

Alternative considered:

- One-shot broad test rewrite (rejected due to high churn and lower reviewability).

### Decision: Prefer targeted branch coverage over broad test count growth

Add tests only where they reduce meaningful risk, especially negative paths and classification branches.

Alternative considered:

- Increase only statement coverage percentage (rejected; could miss risk-heavy branches).

### Decision: Keep e2e focused and unit deterministic

Use unit tests for deterministic branch logic and e2e tests for request-boundary and integration confidence.

Alternative considered:

- Rely mostly on e2e for confidence (rejected; slower feedback and harder branch precision).

### Decision: Enforce quality through CI thresholds

Define explicit coverage thresholds and fail CI when confidence drops below agreed limits.

Alternative considered:

- Team convention without guardrails (rejected; drifts over time).

## Risks / Trade-offs

- [Risk] Thresholds become noisy if set too aggressively. -> Mitigation: start with realistic floor and ratchet upward.
- [Risk] More tests may increase CI time. -> Mitigation: keep tests focused and avoid redundant scenarios.
- [Risk] Mock-heavy tests can diverge from runtime behavior. -> Mitigation: add selected integration-style repository and bootstrap smoke checks.

## Migration Plan

1. Add targeted tests in phases while keeping existing behavior unchanged.
2. Run `make test`, `npm run test:e2e`, and `npm run test:cov` during rollout.
3. Add coverage thresholds only after new tests land and baseline stabilizes.

## Open Questions

- What initial global threshold values should be enforced (for example, branch >= 75 or >= 80)?
- Should integration-style DB tests run in the default pipeline or only in a dedicated job?
