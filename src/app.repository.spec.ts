import { Knex } from 'knex';
import { AppRepository } from './app.repository';

describe('AppRepository', () => {
  let repository: AppRepository;
  let raw: jest.Mock;

  beforeEach(() => {
    raw = jest.fn();
    repository = new AppRepository({ raw } as unknown as Knex);
  });

  it('returns version from a flat result row', async () => {
    raw.mockResolvedValue([{ version: '10.11' }]);

    const version = await repository.getDatabaseVersion();

    expect(raw).toHaveBeenCalledWith('select version() as version');
    expect(version).toBe('10.11');
  });

  it('returns version from a nested result row', async () => {
    raw.mockResolvedValue([[{ version: '10.11' }]]);

    const version = await repository.getDatabaseVersion();

    expect(version).toBe('10.11');
  });

  it('throws when the result contains no version', async () => {
    raw.mockResolvedValue([[]]);

    await expect(repository.getDatabaseVersion()).rejects.toThrow(
      'Database version query returned no rows',
    );
  });
});
