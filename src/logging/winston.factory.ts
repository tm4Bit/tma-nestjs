import { format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import type TransportStream from 'winston-transport';
import type { WinstonModuleOptions } from 'nest-winston';
import type { Env } from '../config/env';
import { getCorrelationId } from './request-context';

const nonErrorFilter = format((info) => {
  return info.level === 'error' ? false : info;
});

const addCorrelationId = format((info) => {
  const correlationId = getCorrelationId();
  if (correlationId && !Reflect.has(info, 'correlationId')) {
    Reflect.set(info, 'correlationId', correlationId);
  }

  return info;
});

const buildConsoleTransport = (env: Env): TransportStream => {
  if (env.NODE_ENV === 'production') {
    return new transports.Console({
      level: env.LOG_LEVEL,
      format: format.combine(
        addCorrelationId(),
        format.timestamp(),
        format.json(),
      ),
    });
  }

  return new transports.Console({
    level: env.LOG_LEVEL,
    format: format.combine(
      addCorrelationId(),
      format.timestamp(),
      format.errors({ stack: true }),
      format.printf(({ timestamp, level, message, correlationId, context }) => {
        const segments = [timestamp, `[${level}]`];
        if (
          typeof context === 'string' ||
          typeof context === 'number' ||
          typeof context === 'boolean'
        ) {
          segments.push(`[${context}]`);
        }
        if (
          typeof correlationId === 'string' ||
          typeof correlationId === 'number' ||
          typeof correlationId === 'boolean'
        ) {
          segments.push(`[corr=${correlationId}]`);
        }
        segments.push(String(message));
        return segments.join(' ');
      }),
    ),
  });
};

const buildErrorFileTransport = (env: Env): TransportStream => {
  return new DailyRotateFile({
    dirname: env.LOG_DIR,
    filename: 'error-%DATE%.log',
    level: 'error',
    datePattern: env.LOG_DATE_PATTERN,
    maxFiles: env.LOG_MAX_FILES,
    maxSize: env.LOG_MAX_SIZE,
    zippedArchive: env.LOG_ZIPPED_ARCHIVE,
    format: format.combine(
      addCorrelationId(),
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    ),
  });
};

const buildCombinedFileTransport = (env: Env): TransportStream => {
  return new DailyRotateFile({
    dirname: env.LOG_DIR,
    filename: 'combined-%DATE%.log',
    level: env.LOG_LEVEL,
    datePattern: env.LOG_DATE_PATTERN,
    maxFiles: env.LOG_MAX_FILES,
    maxSize: env.LOG_MAX_SIZE,
    zippedArchive: env.LOG_ZIPPED_ARCHIVE,
    format: format.combine(
      nonErrorFilter(),
      addCorrelationId(),
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    ),
  });
};

export const buildWinstonModuleOptions = (env: Env): WinstonModuleOptions => {
  const configuredTransports: TransportStream[] = [
    buildConsoleTransport(env),
    buildErrorFileTransport(env),
  ];

  if (env.NODE_ENV === 'production') {
    configuredTransports.push(buildCombinedFileTransport(env));
  }

  return {
    transports: configuredTransports,
  };
};
