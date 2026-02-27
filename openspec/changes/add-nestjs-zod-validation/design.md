## Context

The project already uses Zod for environment validation, but request validation is currently ad hoc and inconsistent. We want a standardized approach for body, query, and path params that integrates cleanly with NestJS and aligns with existing project preferences.

## Goals / Non-Goals

**Goals:**

- Adopt `nestjs-zod` for request validation across controllers.
- Validate body, query, and params consistently with clear error responses.
- Provide reusable helper utilities to minimize boilerplate.

**Non-Goals:**

- Replacing or redesigning global error handling.
- Introducing a full DTO/class-validator layer.
- Validating cookies or headers in this change.

## Decisions

- **Use `nestjs-zod` pipes** for request body, query, and params.
  - _Rationale_: Provides Zod-native validation with NestJS integration.
  - _Alternatives_: Manual Zod parsing in controllers (more boilerplate).

- **Create a shared validation helper** to reduce repetition in controllers.
  - _Rationale_: Keeps controllers focused on logic while reusing schemas.
  - _Alternatives_: Inline parsing in every controller (rejected).

## Risks / Trade-offs

- **Risk**: Inconsistent adoption across modules.
  - **Mitigation**: Provide a clear example and update existing controllers as reference.

- **Trade-off**: Adds dependency and pipe usage that developers must learn.
  - **Mitigation**: Document usage and provide a small set of examples.
