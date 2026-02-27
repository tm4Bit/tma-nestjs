## ADDED Requirements

### Requirement: Create a blog post

The system SHALL allow clients to create a blog post with title, slug, content, and optional published_at.

#### Scenario: Creating a post

- **WHEN** a client submits a valid blog post payload
- **THEN** the system persists the post and returns the created record

### Requirement: List blog posts

The system SHALL allow clients to list blog posts ordered by creation date descending.

#### Scenario: Listing posts

- **WHEN** a client requests the blog posts list
- **THEN** the system returns the posts ordered by created_at descending

### Requirement: Fetch a blog post

The system SHALL allow clients to retrieve a single blog post by id.

#### Scenario: Fetching a post

- **WHEN** a client requests a blog post by id
- **THEN** the system returns the matching post or a not found response

### Requirement: Update a blog post

The system SHALL allow clients to update title, slug, content, and published_at of an existing blog post.

#### Scenario: Updating a post

- **WHEN** a client submits an update for an existing post
- **THEN** the system persists the changes and returns the updated record

### Requirement: Delete a blog post

The system SHALL allow clients to delete a blog post by id.

#### Scenario: Deleting a post

- **WHEN** a client requests deletion of a post by id
- **THEN** the system removes the post and returns a success response
