## Why

The blog post repository `update` method currently performs defensive input filtering and an empty-payload guard that are redundant for the intended placeholder use case, because request validation already rejects invalid update bodies at the API boundary. Simplifying this method to pass input directly to Knex reduces code noise and keeps the example implementation straightforward.

## What Changes

- Simplify `BlogPostsRepository.update` to pass `input` directly into Knex `update(...)`.
- Remove local update payload filtering and empty-object fallback logic from repository update.
- Update repository and service/controller-adjacent tests to reflect direct-update behavior and expected outcomes.
- Keep Zod validation contract unchanged at the controller boundary.

## Capabilities

### New Capabilities

- `blog-posts-repository-update-placeholder`: Defines simplified placeholder update behavior where repository update forwards validated input directly to Knex and relies on affected-row results.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/blog-posts/blog-posts.repository.ts` and `src/blog-posts/blog-posts.repository.spec.ts` (plus any tests asserting empty-update fallback behavior).
- APIs: No endpoint contract changes; Zod schemas remain source of request validation.
- Dependencies/systems: No new dependencies.
