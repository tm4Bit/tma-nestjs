import type { Env } from '../config/env';
import { buildWinstonModuleOptions } from './winston.factory';

const buildEnv = (overrides: Partial<Env>): Env => {
  return {
    NODE_ENV: 'development',
    PORT: 8080,
    DB_HOST: 'localhost',
    DB_PORT: 3306,
    DB_NAME: 'app',
    DB_USER: 'app',
    DB_PASSWORD: 'app',
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: '',
    LOG_DIR: '/app/.logs',
    LOG_LEVEL: 'debug',
    LOG_MAX_FILES: '14d',
    LOG_MAX_SIZE: '20m',
    LOG_DATE_PATTERN: 'YYYY-MM-DD',
    LOG_ZIPPED_ARCHIVE: false,
    ...overrides,
  };
};

describe('buildWinstonModuleOptions', () => {
  const getTransports = (
    transports: ReturnType<typeof buildWinstonModuleOptions>['transports'],
  ) => {
    if (!transports) {
      return [];
    }

    return Array.isArray(transports) ? transports : [transports];
  };

  it('uses console + error rotating file in development', () => {
    const options = buildWinstonModuleOptions(
      buildEnv({ NODE_ENV: 'development', LOG_ZIPPED_ARCHIVE: false }),
    );

    const transports = getTransports(options.transports);

    expect(transports).toHaveLength(2);
    const names = transports.map((transport) => transport.constructor.name);
    expect(names).toEqual(['Console', 'DailyRotateFile']);

    const [consoleTransport, errorFileTransport] = transports;
    const consoleLevel = (consoleTransport as { level?: string }).level;
    const errorLevel = (errorFileTransport as { level?: string }).level;

    expect(consoleLevel).toBe('debug');
    expect(errorLevel).toBe('error');
  });

  it('uses console + error + combined rotating files in production', () => {
    const options = buildWinstonModuleOptions(
      buildEnv({
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        LOG_ZIPPED_ARCHIVE: true,
      }),
    );

    const transports = getTransports(options.transports);

    expect(transports).toHaveLength(3);
    const dailyTransports = transports.filter(
      (transport) => transport.constructor.name === 'DailyRotateFile',
    );

    expect(dailyTransports).toHaveLength(2);
    const dailyLevels = dailyTransports.map(
      (transport) => (transport as { level?: string }).level,
    );
    expect(dailyLevels).toEqual(expect.arrayContaining(['error', 'info']));

    const dailyConfigs = dailyTransports.map((transport) => {
      const candidate = transport as {
        filename?: string;
        options?: {
          filename?: string;
          maxFiles?: string;
          maxSize?: string;
          zippedArchive?: boolean;
        };
      };

      return {
        filename: candidate.filename ?? candidate.options?.filename,
        maxFiles: candidate.options?.maxFiles,
        maxSize: candidate.options?.maxSize,
        zippedArchive: candidate.options?.zippedArchive,
      };
    });

    expect(dailyConfigs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: 'error-%DATE%.log',
          maxFiles: '14d',
          maxSize: '20m',
          zippedArchive: true,
        }),
        expect.objectContaining({
          filename: 'combined-%DATE%.log',
          maxFiles: '14d',
          maxSize: '20m',
          zippedArchive: true,
        }),
      ]),
    );
  });
});
