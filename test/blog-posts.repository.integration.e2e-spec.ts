import { knex, Knex } from 'knex';
import { buildKnexConfig } from '../src/database/knex.config';
import { resetEnv } from '../src/config/env';
import { BlogPostsRepository } from '../src/blog-posts/blog-posts.repository';

const isDbIntegrationEnabled = process.env.RUN_DB_INTEGRATION_TESTS === '1';
const describeDbIntegration = isDbIntegrationEnabled ? describe : describe.skip;

describeDbIntegration('BlogPostsRepository integration (MariaDB)', () => {
  let db: Knex;
  let repository: BlogPostsRepository;
  const createdIds: number[] = [];

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = process.env.DB_HOST ?? '127.0.0.1';
    process.env.DB_PORT = process.env.DB_PORT ?? '3306';
    process.env.DB_NAME = process.env.DB_NAME ?? 'app';
    process.env.DB_USER = process.env.DB_USER ?? 'app';
    process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'app';
    process.env.REDIS_HOST = process.env.REDIS_HOST ?? '127.0.0.1';
    process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6379';
    process.env.REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? '';

    resetEnv();
    db = knex(buildKnexConfig());
    repository = new BlogPostsRepository(db);

    await db.raw(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        published_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY blog_posts_slug_unique (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  });

  afterAll(async () => {
    if (createdIds.length > 0) {
      await db('blog_posts').whereIn('id', createdIds).del();
    }

    await db.destroy();
  });

  it('returns updated row when update affects one row', async () => {
    const slug = `integration-${Date.now()}`;
    const [id] = await db('blog_posts').insert({
      title: 'Before',
      slug,
      content: 'Before content',
      published_at: null,
    });

    createdIds.push(Number(id));

    const updated = await repository.update(Number(id), {
      title: 'After',
      content: 'After content',
    });

    expect(updated).toEqual(
      expect.objectContaining({
        id: Number(id),
        title: 'After',
        slug,
        content: 'After content',
      }),
    );
  });

  it('returns null when update affects zero rows', async () => {
    const missing = await repository.update(987654321, {
      title: 'Missing',
    });

    expect(missing).toBeNull();
  });
});
