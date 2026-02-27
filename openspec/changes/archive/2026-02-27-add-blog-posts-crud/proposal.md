## Why

We need a baseline blog posts CRUD to validate the NestJS architecture, repository patterns, and testing strategy before adding more complex domains.

## What Changes

- Add REST endpoints to create, list, fetch, update, and delete blog posts.
- Introduce repository/service layers for blog posts using Knex.
- Add validation and tests for blog post flows (unit + e2e).

## Capabilities

### New Capabilities

- `blog-posts`: CRUD operations for blog posts via HTTP API.

### Modified Capabilities

- _None._

## Impact

- New modules, controllers, services, repositories for blog posts.
- Database schema migration for blog_posts.
- Tests for repository/service/controller behavior.
