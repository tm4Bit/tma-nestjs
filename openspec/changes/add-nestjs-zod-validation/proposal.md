## Why

We need consistent, type-safe validation for request body, query params, and path params across the API. Using `nestjs-zod` standardizes validation and error handling while aligning with the project's Zod preference.

## What Changes

- Integrate `nestjs-zod` validation for body, query, and params.
- Provide reusable Zod schemas and pipes for controllers.
- Add tests to ensure validation errors are returned consistently.

## Capabilities

### New Capabilities

- `nestjs-zod-validation`: Validation for request body, query params, and path params using `nestjs-zod`.

### Modified Capabilities

- _None._

## Impact

- New validation utilities and controller patterns.
- Additional dependency on `nestjs-zod`.
- Tests for validation behavior.
