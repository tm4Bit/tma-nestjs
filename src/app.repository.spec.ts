import { Knex } from 'knex';
import { AppRepository } from './app.repository';

describe('AppRepository', () => {
  it('uses Knex raw queries for database access', async () => {
    const raw = jest.fn().mockResolvedValue([{ version: '10.11' }]);
    const db = { raw } as unknown as Knex;
    const repository = new AppRepository(db);

    const version = await repository.getDatabaseVersion();

    expect(raw).toHaveBeenCalledWith('select version() as version');
    expect(version).toBe('10.11');
  });
});
