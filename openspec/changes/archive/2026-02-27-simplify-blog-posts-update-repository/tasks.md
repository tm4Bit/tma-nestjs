## 1. Repository update simplification

- [x] 1.1 Replace defensive `updates` filtering logic in `src/blog-posts/blog-posts.repository.ts` with direct Knex call `update(input)`
- [x] 1.2 Remove debug/temporary logging in repository update flow and keep return semantics (`null` on 0 rows, fetch row on success)

## 2. Unit test alignment

- [x] 2.1 Update `src/blog-posts/blog-posts.repository.spec.ts` update-action tests to assert direct payload pass-through to Knex
- [x] 2.2 Remove/replace tests that expect empty-object fallback behavior (`update({}, ...)` returning `findById`) with tests that match simplified contract
- [x] 2.3 Run focused blog-post repository tests and adjust mocks for affected-row semantics

## 3. Regression verification

- [x] 3.1 Run full unit suite with `make test` and fix regressions introduced by simplification
- [x] 3.2 Confirm only intended files changed (repository update logic + related tests)
