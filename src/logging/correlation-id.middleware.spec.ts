import type { NextFunction, Request, Response } from 'express';
import {
  CORRELATION_ID_HEADER,
  resolveRequestCorrelationId,
} from './correlation-id';
import { correlationIdMiddleware } from './correlation-id.middleware';
import { getCorrelationId } from './request-context';

describe('correlationIdMiddleware', () => {
  const buildRequest = (requestId?: string): Request => {
    return {
      header: (name: string) =>
        name.toLowerCase() === 'x-request-id' ? requestId : undefined,
    } as Request;
  };

  const buildResponse = (): {
    response: Response;
    setHeader: jest.Mock;
  } => {
    const setHeader = jest.fn();

    return {
      response: {
        setHeader,
      } as unknown as Response,
      setHeader,
    };
  };

  it('reuses incoming X-Request-Id header', () => {
    const request = buildRequest('existing-id');
    const { response, setHeader } = buildResponse();
    const next = jest.fn(() => {
      expect(getCorrelationId()).toBe('existing-id');
      expect(resolveRequestCorrelationId(request)).toBe('existing-id');
    }) as NextFunction;

    correlationIdMiddleware(request, response, next);

    expect(setHeader).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      'existing-id',
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('generates correlation id when header is missing', () => {
    const request = buildRequest();
    const { response, setHeader } = buildResponse();
    const next = jest.fn(() => {
      const correlationId = getCorrelationId();
      expect(correlationId).toBeDefined();
      expect(correlationId).toHaveLength(36);
    }) as NextFunction;

    correlationIdMiddleware(request, response, next);

    expect(setHeader).toHaveBeenCalledTimes(1);
    const [header, generatedCorrelationId] = setHeader.mock.calls[0] as [
      string,
      string,
    ];
    expect(header).toBe(CORRELATION_ID_HEADER);
    expect(generatedCorrelationId).toHaveLength(36);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
