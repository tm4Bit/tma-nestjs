## 1. Validation and contract hardening

- [x] 1.1 Add focused tests for blog-post update validation edge cases (`{}`, `null` fields, invalid types, valid partial updates)
- [x] 1.2 Add/expand request-boundary tests for `PUT /blog-posts/:id` negative paths and expected Problem Details contract
- [x] 1.3 Verify repository update contract tests cover affected-row semantics (`0 -> null`, `>0 -> fetch updated row`) and direct payload forwarding

## 2. Error-surface branch hardening

- [x] 2.1 Expand `problem-details.mapper` tests to cover conflict/unavailable/unknown classification branches comprehensively
- [x] 2.2 Expand `problem-details.filters` tests for fallback and cross-filter behavior consistency
- [x] 2.3 Add e2e error-path assertions for validation, HTTP not-found, database mapped failures, and unexpected failures

## 3. Runtime wiring confidence

- [x] 3.1 Add lightweight tests for `configureHttpApp` filter registration behavior
- [x] 3.2 Add smoke-level bootstrap/wiring test coverage for app/module startup assumptions
- [x] 3.3 Add one integration-style repository path against containerized MariaDB to validate real update semantics

## 4. Coverage governance and CI durability

- [x] 4.1 Configure practical Jest coverage thresholds aligned with new baseline (including branch threshold)
- [x] 4.2 Update CI/test workflow to enforce `test`, `test:e2e`, and coverage gate checks
- [x] 4.3 Document testing expectations and coverage-gate policy in project docs for future contributors

## 5. Regression verification

- [x] 5.1 Run `make lint`, `make test`, and `npm run test:e2e` and fix any regressions
- [x] 5.2 Run `npm run test:cov`, capture resulting baseline, and confirm thresholds pass locally
