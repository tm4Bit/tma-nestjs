## Why

Current unit tests exist for service, controller, and repository layers, but test organization and scenario coverage are not consistently structured by action. This makes tests harder to scan and can hide missing cases for specific actions.

## What Changes

- Expand unit test coverage for blog posts service, controller, and repository actions.
- Reorganize test suites to use one `describe` block per action (for example, `create`, `index/list`, `show/findById`, `update`, `destroy/delete`) in each layer.
- Add missing success, validation/error, and not-found scenarios per action where coverage is incomplete.
- Keep runtime behavior unchanged; this change improves test quality and maintainability only.

## Capabilities

### New Capabilities

- `test-suite-structure`: Defines consistent per-action test suite organization and minimum action-level coverage expectations for service/controller/repository unit tests.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/blog-posts/*.spec.ts` and any shared testing helpers used by these suites.
- APIs: No API contract changes.
- Dependencies/systems: No new runtime dependencies; only test code updates.
