## Context

The current blog-post update repository method contains defensive transformation logic (filtering `undefined`, handling empty payload as read-only fallback) in addition to database update execution. For this starter project, update requests already pass through Zod DTO validation in the controller layer, and the repository is intended to remain a simple Knex usage example.

The requested change keeps validation at the API boundary and simplifies data access code by forwarding the repository input directly to Knex, then relying on affected-row semantics and existing service-level not-found handling.

## Goals / Non-Goals

**Goals:**

- Simplify `BlogPostsRepository.update` to directly call Knex `update(input)`.
- Preserve current API validation contract in Zod schemas.
- Align unit tests with the simplified repository behavior and keep tests readable.

**Non-Goals:**

- Change endpoint schema/DTO rules for update payloads.
- Introduce new validation libraries or runtime dependencies.
- Modify unrelated repository methods (`create`, `list`, `findById`, `publish`, `delete`).

## Decisions

### Decision: Keep validation in controller schema, not repository

Repository update will trust validated inputs and not re-implement input sanitization logic. This keeps responsibilities clear for a placeholder architecture.

Alternative considered:

- Keep defensive repository filtering for robustness (rejected for this starter-case simplification).

### Decision: Treat zero affected rows as not found in repository contract

If Knex update returns `0`, repository returns `null`, preserving the existing not-found propagation to the service.

Alternative considered:

- Return existing row on empty input (rejected; behavior no longer needed in simplified flow).

### Decision: Update tests to assert direct pass-through

Repository tests will assert that `update` is called with the same input payload and remove expectations tied to empty-object fallback behavior.

Alternative considered:

- Keep old tests and branch behavior (rejected; conflicts with simplification objective).

## Risks / Trade-offs

- [Risk] Internal callers bypassing Zod could pass empty payloads and receive `null` due to DB affected-row behavior. -> Mitigation: document that update input must come from validated boundary in this starter project.
- [Risk] Placeholder semantics may differ from stricter production repository patterns. -> Mitigation: keep this explicitly scoped as starter/example behavior and cover with tests.
