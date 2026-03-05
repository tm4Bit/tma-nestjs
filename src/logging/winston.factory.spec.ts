import { format } from 'winston';
import type { Env } from '../config/env';
import { buildWinstonModuleOptions } from './winston.factory';

jest.mock('winston-daily-rotate-file', () => {
  return class DailyRotateFile {
    level: string | undefined;
    options: Record<string, unknown>;

    constructor(options: Record<string, unknown>) {
      this.level = options.level as string | undefined;
      this.options = options;
    }
  };
});

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

describe('development console printf formatter', () => {
  type LogInfo = Record<string, unknown>;
  let capturedPrintf: (info: LogInfo) => string;

  beforeEach(() => {
    jest.spyOn(format, 'printf').mockImplementation((fn) => {
      capturedPrintf = fn as unknown as (info: LogInfo) => string;
      return { transform: (info: unknown) => info } as ReturnType<typeof format.printf>;
    });
    buildWinstonModuleOptions(buildEnv({ NODE_ENV: 'development' }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('joins timestamp, level and message', () => {
    expect(capturedPrintf({ timestamp: '2024-01-01', level: 'info', message: 'hello' })).toBe(
      '2024-01-01 [info] hello',
    );
  });

  it.each([
    ['string', 'AppService'],
    ['number', 42],
    ['boolean', true],
  ])('includes context when it is a %s', (_type, context) => {
    const result = capturedPrintf({ timestamp: 't', level: 'info', message: 'm', context });
    expect(result).toContain(`[${String(context)}]`);
  });

  it('omits context when it is an object', () => {
    const result = capturedPrintf({ timestamp: 't', level: 'info', message: 'm', context: {} });
    expect(result).not.toContain('[object');
  });

  it.each([
    ['string', 'req-abc'],
    ['number', 99],
    ['boolean', false],
  ])('includes correlationId when it is a %s', (_type, correlationId) => {
    const result = capturedPrintf({ timestamp: 't', level: 'info', message: 'm', correlationId });
    expect(result).toContain(`[corr=${String(correlationId)}]`);
  });

  it('omits correlationId when it is an object', () => {
    const result = capturedPrintf({ timestamp: 't', level: 'info', message: 'm', correlationId: {} });
    expect(result).not.toContain('corr=');
  });

  it('does not use printf formatter in production', () => {
    jest.restoreAllMocks();
    const spy = jest.spyOn(format, 'printf');
    buildWinstonModuleOptions(buildEnv({ NODE_ENV: 'production' }));
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('nonErrorFilter and addCorrelationId', () => {
  type TransformFn = (info: Record<string, unknown>) => Record<string, unknown> | false;

  let nonErrorFilterFn: TransformFn;
  let addCorrelationIdFn: TransformFn;
  let mockGetCorrelationId: jest.Mock<string | undefined>;

  beforeAll(() => {
    const callbacks: TransformFn[] = [];
    mockGetCorrelationId = jest.fn<string | undefined, []>();

    jest.isolateModules(() => {
      jest.doMock('./request-context', () => ({
        getCorrelationId: mockGetCorrelationId,
      }));
      jest.doMock('winston-daily-rotate-file', () => {
        return class DailyRotateFile {
          constructor(_options: Record<string, unknown>) {}
        };
      });

      const actualWinston = jest.requireActual<typeof import('winston')>('winston');
      jest.doMock('winston', () => ({
        ...actualWinston,
        format: Object.assign(
          (fn: TransformFn) => {
            callbacks.push(fn);
            return actualWinston.format(fn);
          },
          actualWinston.format,
        ),
      }));

      require('./winston.factory');
    });

    [nonErrorFilterFn, addCorrelationIdFn] = callbacks;
  });

  describe('nonErrorFilter', () => {
    it('passes through non-error log entries', () => {
      const info = { level: 'info', message: 'hello' };
      expect(nonErrorFilterFn(info)).toBe(info);
    });

    it('blocks error-level log entries', () => {
      expect(nonErrorFilterFn({ level: 'error', message: 'boom' })).toBe(false);
    });
  });

  describe('addCorrelationId', () => {
    beforeEach(() => {
      mockGetCorrelationId.mockReset();
    });

    it('adds correlationId from async context when absent from info', () => {
      mockGetCorrelationId.mockReturnValue('corr-123');
      const info: Record<string, unknown> = { level: 'info', message: 'test' };
      addCorrelationIdFn(info);
      expect(info.correlationId).toBe('corr-123');
    });

    it('does not overwrite an existing correlationId on info', () => {
      mockGetCorrelationId.mockReturnValue('new-corr');
      const info = { level: 'info', message: 'test', correlationId: 'original' };
      addCorrelationIdFn(info);
      expect(info.correlationId).toBe('original');
    });

    it('leaves info unchanged when no correlationId in context', () => {
      mockGetCorrelationId.mockReturnValue(undefined);
      const info: Record<string, unknown> = { level: 'info', message: 'test' };
      addCorrelationIdFn(info);
      expect(info.correlationId).toBeUndefined();
    });

    it('returns the info object', () => {
      mockGetCorrelationId.mockReturnValue(undefined);
      const info = { level: 'info', message: 'test' };
      expect(addCorrelationIdFn(info)).toBe(info);
    });
  });
});
