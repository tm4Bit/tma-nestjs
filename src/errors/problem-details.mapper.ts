import { HttpException, HttpStatus } from '@nestjs/common';
import type { Request } from 'express';
import {
  createProblemDetails,
  DatabaseErrorCategory,
  ProblemDetails,
  PROBLEM_TYPE,
} from './problem-details';

type DatabaseErrorDescriptor = {
  status: number;
  title: string;
  detail: string;
  type: string;
  category: DatabaseErrorCategory;
  instance: string;
};

type ZodIssue = {
  path?: unknown;
  message?: unknown;
  code?: unknown;
};

const getObjectProperty = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  return record[key];
};

const formatInstance = (request: Request): string => {
  return request.originalUrl || request.url || '/';
};

const getReasonPhrase = (status: number): string => {
  const codeName = HttpStatus[status];

  if (typeof codeName !== 'string') {
    return 'Error';
  }

  return codeName
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const extractHttpDetail = (responseBody: unknown, fallback: string): string => {
  if (typeof responseBody === 'string') {
    return responseBody;
  }

  if (responseBody && typeof responseBody === 'object') {
    const message = getObjectProperty(responseBody, 'message');

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }

    if (Array.isArray(message) && message.length > 0) {
      return message.filter((item) => typeof item === 'string').join(', ');
    }
  }

  return fallback;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => typeof item === 'string');
};

const formatPath = (value: unknown): string => {
  const pathSegments = asStringArray(value);
  if (pathSegments.length === 0) {
    return 'root';
  }

  return pathSegments.join('.');
};

export const buildHttpProblemDetails = (
  exception: HttpException,
  request: Request,
): ProblemDetails => {
  const status = exception.getStatus();
  const title = getReasonPhrase(status);
  const fallbackDetail =
    status >= 500 ? 'An unexpected error occurred' : 'Request failed';

  return createProblemDetails({
    type: PROBLEM_TYPE.httpException,
    title,
    status,
    detail: extractHttpDetail(exception.getResponse(), fallbackDetail),
    instance: formatInstance(request),
  });
};

export const buildValidationProblemDetails = (
  exception: { getZodError(): unknown },
  request: Request,
): ProblemDetails => {
  const zodError = exception.getZodError();
  const issuesRaw =
    zodError && typeof zodError === 'object'
      ? getObjectProperty(zodError, 'issues')
      : undefined;
  const issues = Array.isArray(issuesRaw) ? (issuesRaw as ZodIssue[]) : [];

  const errors = issues.map((issue) => {
    const message =
      typeof issue.message === 'string' && issue.message.trim().length > 0
        ? issue.message
        : 'Invalid value';
    const code = typeof issue.code === 'string' ? issue.code : undefined;

    return {
      path: formatPath(issue.path),
      message,
      ...(code ? { code } : {}),
    };
  });

  return createProblemDetails({
    type: PROBLEM_TYPE.validationError,
    title: 'Bad Request',
    status: HttpStatus.BAD_REQUEST,
    detail: 'Validation failed',
    instance: formatInstance(request),
    errors,
  });
};

const getErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const code = getObjectProperty(error, 'code');
  if (typeof code === 'string') {
    return code;
  }

  return undefined;
};

const getErrorErrno = (error: unknown): number | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const errno = getObjectProperty(error, 'errno');
  return typeof errno === 'number' ? errno : undefined;
};

const getErrorName = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const name = getObjectProperty(error, 'name');
  return typeof name === 'string' ? name : undefined;
};

export const classifyDatabaseError = (
  error: unknown,
): DatabaseErrorCategory => {
  const code = getErrorCode(error);
  const errno = getErrorErrno(error);
  const name = getErrorName(error);

  const conflictCodes = new Set(['ER_DUP_ENTRY', 'ER_DUP_KEY']);
  if (errno === 1062 || (code && conflictCodes.has(code))) {
    return 'conflict';
  }

  const unavailableCodes = new Set([
    'ETIMEDOUT',
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'PROTOCOL_CONNECTION_LOST',
    'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  ]);
  if (name === 'KnexTimeoutError' || (code && unavailableCodes.has(code))) {
    return 'unavailable';
  }

  return 'unknown';
};

export const buildDatabaseProblemDetails = (
  error: unknown,
  request: Request,
): DatabaseErrorDescriptor => {
  const category = classifyDatabaseError(error);
  const instance = formatInstance(request);

  if (category === 'conflict') {
    return {
      category,
      status: HttpStatus.CONFLICT,
      title: 'Conflict',
      detail: 'Database constraint conflict',
      type: PROBLEM_TYPE.databaseConflict,
      instance,
    };
  }

  if (category === 'unavailable') {
    return {
      category,
      status: HttpStatus.SERVICE_UNAVAILABLE,
      title: 'Service Unavailable',
      detail: 'Database is temporarily unavailable',
      type: PROBLEM_TYPE.databaseUnavailable,
      instance,
    };
  }

  return {
    category,
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    title: 'Internal Server Error',
    detail: 'An unexpected database error occurred',
    type: PROBLEM_TYPE.databaseError,
    instance,
  };
};

export const buildUnexpectedProblemDetails = (
  request: Request,
): ProblemDetails => {
  return createProblemDetails({
    type: PROBLEM_TYPE.unexpectedError,
    title: 'Internal Server Error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    detail: 'An unexpected error occurred',
    instance: formatInstance(request),
  });
};
