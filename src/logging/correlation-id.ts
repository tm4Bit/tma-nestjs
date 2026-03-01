import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { getCorrelationId } from './request-context';

export const CORRELATION_ID_HEADER = 'X-Request-Id';

const sanitizeCorrelationId = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveIncomingCorrelationId = (request: Request): string => {
  const headerValue = request.header(CORRELATION_ID_HEADER);
  return sanitizeCorrelationId(headerValue) ?? randomUUID();
};

export const resolveRequestCorrelationId = (
  request: Request,
): string | undefined => {
  return (
    getCorrelationId() ??
    sanitizeCorrelationId(request.header(CORRELATION_ID_HEADER))
  );
};
