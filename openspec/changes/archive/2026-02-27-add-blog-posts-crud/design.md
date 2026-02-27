## Context

The project needs a concrete CRUD feature to exercise the NestJS module structure, repository/service pattern with Knex, validation, serialization, and testing strategy. Blog posts are a small, well-understood domain that can serve as the reference implementation for future resources.

## Goals / Non-Goals

**Goals:**

- Implement a full CRUD API for blog posts with consistent controller/service/repository layers.
- Use Knex for all SQL access and maintain clean separation of responsibilities.
- Provide request validation and consistent response formatting.
- Add unit and e2e tests for the blog posts flow.

**Non-Goals:**

- Authentication/authorization for blog posts.
- Comments, tags, or rich text formatting.
- Full-text search or pagination beyond a basic list.

## Decisions

- **Use a dedicated BlogPostsModule** with controller, service, and repository.
  - _Rationale_: Keeps the resource isolated and repeatable for future domains.
  - _Alternatives_: Add endpoints directly in AppModule (rejected for scalability).

- **Store posts in a blog_posts table** with id, title, slug, content, published_at, created_at, updated_at.
  - _Rationale_: Simple structure with room for future expansion.
  - _Alternatives_: JSON column for content metadata (defer for simplicity).

- **Validation via Zod schema per route** for create/update payloads and params.
  - _Rationale_: Aligns with existing validation approach and keeps rules explicit.
  - _Alternatives_: Class-validator (not aligned with project direction).

## Risks / Trade-offs

- **Risk**: Schema or endpoint shape may need changes as requirements evolve.
  - **Mitigation**: Keep routes and models minimal; document assumptions.

- **Trade-off**: Minimal feature set may not cover all real-world use cases.
  - **Mitigation**: Use this CRUD as a baseline and extend in future changes.
