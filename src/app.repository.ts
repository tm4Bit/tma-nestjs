import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from './database/knex.config';
import { Repository } from './database/repository';

type VersionRow = { version: string };
type NestedQueryResult = Array<Array<VersionRow>>;
type FlatQueryResult = Array<VersionRow>;

@Injectable()
export class AppRepository extends Repository {
  constructor(@Inject(KNEX_CONNECTION) db: Knex) {
    super(db);
  }

  async getDatabaseVersion(): Promise<string> {
    const result = await this.db.raw<NestedQueryResult | FlatQueryResult>(
      'select version() as version',
    );
    const first = result[0];
    const row = Array.isArray(first) ? first[0] : first;

    if (!row?.version) {
      throw new Error('Database version query returned no rows');
    }

    return row.version;
  }
}
