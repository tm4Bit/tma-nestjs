import type { Knex } from 'knex';
import { getEnv } from '../config/env.js';

export const KNEX_CONNECTION = Symbol('KNEX_CONNECTION');

export const buildKnexConfig = (): Knex.Config => {
  const env = getEnv();

  return {
    client: 'mysql2',
    connection: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: 'src/database/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: 'src/database/seeds',
    },
  };
};
