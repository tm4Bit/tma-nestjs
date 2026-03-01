import type { NextFunction, Request, Response } from 'express';
import {
  CORRELATION_ID_HEADER,
  resolveIncomingCorrelationId,
} from './correlation-id';
import { runWithCorrelationId } from './request-context';

export const correlationIdMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const correlationId = resolveIncomingCorrelationId(request);
  response.setHeader(CORRELATION_ID_HEADER, correlationId);

  runWithCorrelationId(correlationId, () => {
    next();
  });
};
