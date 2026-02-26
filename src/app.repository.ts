import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from './database/knex.config.js';
import { Repository } from './database/repository.js';

@Injectable()
export class AppRepository extends Repository {
  constructor(@Inject(KNEX_CONNECTION) db: Knex) {
    super(db);
  }

  async getDatabaseVersion(): Promise<string> {
    const result = await this.db.raw('select version() as version');
    const [row] = Array.isArray(result) ? result : result[0];

    return row?.version ?? 'unknown';
  }
}
