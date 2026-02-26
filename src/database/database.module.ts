import {
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Knex, knex } from 'knex';
import { buildKnexConfig, KNEX_CONNECTION } from './knex.config.js';

@Global()
@Module({
  providers: [
    {
      provide: KNEX_CONNECTION,
      useFactory: (): Knex => knex(buildKnexConfig()),
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly db: Knex) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      await this.db.raw('select 1');
      this.logger.log('Knex connection initialized');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.db.destroy();
    this.logger.log('Knex connection destroyed');
  }
}
