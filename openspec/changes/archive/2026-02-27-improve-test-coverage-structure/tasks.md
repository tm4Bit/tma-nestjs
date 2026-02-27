## 1. Baseline and action map

- [x] 1.1 Review `src/blog-posts/blog-posts.service.spec.ts` and document action-to-describe mapping (`create`, `findAll/list`, `findOne/show`, `update`, `remove/delete`)
- [x] 1.2 Review `src/blog-posts/blog-posts.controller.spec.ts` and document action-to-describe mapping (`create`, `findAll/index`, `findOne/show`, `update`, `remove/destroy`)
- [x] 1.3 Review `src/blog-posts/blog-posts.repository.spec.ts` and document action-to-describe mapping (`create`, `list`, `findById`, `update`, `delete`)

## 2. Service test restructuring and coverage

- [x] 2.1 Reorganize service tests into one `describe` block per action while preserving existing assertions
- [x] 2.2 Add missing service action scenarios (success + relevant failure/not-found paths) based on current service contract
- [x] 2.3 Run service-focused tests and update fixtures/mocks to keep tests deterministic

## 3. Controller test restructuring and coverage

- [x] 3.1 Reorganize controller tests into one `describe` block per action while preserving existing assertions
- [x] 3.2 Add missing controller action scenarios (success + relevant validation/error paths) based on current controller contract
- [x] 3.3 Run controller-focused tests and adjust DTO/mock setup to maintain behavior-only assertions

## 4. Repository test restructuring and coverage

- [x] 4.1 Reorganize repository tests into one `describe` block per action while preserving query behavior expectations
- [x] 4.2 Add missing repository action scenarios (success + relevant no-row/edge cases) based on current repository contract
- [x] 4.3 Run repository-focused tests and refine Knex mocks for each action path

## 5. Regression verification

- [x] 5.1 Run full unit suite with `make test` in the Docker dev workflow and fix any regressions
- [x] 5.2 Confirm no production code behavior changed; only test files and test helpers were modified
