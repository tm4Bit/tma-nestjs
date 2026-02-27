import type { Knex } from 'knex';

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('blog_posts', (table) => {
    table.increments('id').primary();
    table.string('title', 255).notNullable();
    table.string('slug', 255).notNullable().unique();
    table.text('content').notNullable();
    table.timestamp('published_at').nullable();
    table.timestamps(true, true);
  });
};

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('blog_posts');
};
