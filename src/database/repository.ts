import { Knex } from 'knex';

export abstract class Repository {
  protected constructor(protected readonly db: Knex) {}
}
