import {
  ArgumentsHost,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  GlobalProblemDetailsFilter,
  HttpProblemDetailsFilter,
  ZodValidationProblemDetailsFilter,
} from './problem-details.filters';
import { PROBLEM_JSON_CONTENT_TYPE, PROBLEM_TYPE } from './problem-details';

const buildHost = (request: Request) => {
  const response = {
    status: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as ArgumentsHost;

  return { host, response };
};

describe('problem-details.filters', () => {
  const envSnapshot = { ...process.env };

  const request = {
    originalUrl: '/blog-posts',
    url: '/blog-posts',
    method: 'GET',
    header: (name: string) =>
      name.toLowerCase() === 'x-request-id' ? 'req-123' : undefined,
  } as Request;

  afterEach(() => {
    process.env = envSnapshot;
  });

  it('handles HttpException as RFC 7807', () => {
    const filter = new HttpProblemDetailsFilter();
    const { host, response } = buildHost(request);

    filter.catch(new NotFoundException('missing'), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      PROBLEM_JSON_CONTENT_TYPE,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PROBLEM_TYPE.httpException,
        detail: 'missing',
      }),
    );
  });

  it('handles zod validation errors with errors extension', () => {
    const filter = new ZodValidationProblemDetailsFilter();
    const { host, response } = buildHost(request);
    const exception = new BadRequestException() as BadRequestException & {
      getZodError: () => unknown;
    };
    exception.getZodError = () => ({
      issues: [{ path: ['limit'], message: 'Too small', code: 'too_small' }],
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      PROBLEM_JSON_CONTENT_TYPE,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PROBLEM_TYPE.validationError,
        errors: [{ path: 'limit', message: 'Too small', code: 'too_small' }],
      }),
    );
  });

  it('falls back to HttpException mapper in zod filter', () => {
    const filter = new ZodValidationProblemDetailsFilter();
    const { host, response } = buildHost(request);

    filter.catch(new BadRequestException('invalid body'), host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PROBLEM_TYPE.httpException,
        detail: 'invalid body',
      }),
    );
  });

  it('maps known database errors in global filter', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host, response } = buildHost(request);

    filter.catch({ code: 'ER_DUP_ENTRY' }, host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ type: PROBLEM_TYPE.databaseConflict }),
    );
  });

  it('maps unavailable database errors in global filter', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host, response } = buildHost(request);

    filter.catch({ code: 'ETIMEDOUT' }, host);

    expect(response.status).toHaveBeenCalledWith(503);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ type: PROBLEM_TYPE.databaseUnavailable }),
    );
  });

  it('maps HttpException in global filter', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host, response } = buildHost(request);

    filter.catch(new NotFoundException('missing'), host);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PROBLEM_TYPE.httpException,
        detail: 'missing',
      }),
    );
  });

  it('maps zod validation exception in global filter', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host, response } = buildHost(request);
    const exception = new BadRequestException() as BadRequestException & {
      getZodError: () => unknown;
    };
    exception.getZodError = () => ({
      issues: [{ path: ['title'], message: 'Required', code: 'invalid_type' }],
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PROBLEM_TYPE.validationError,
        errors: [
          {
            path: 'title',
            message: 'Required',
            code: 'invalid_type',
          },
        ],
      }),
    );
  });

  it('maps unknown exceptions to 500 problem details', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host, response } = buildHost(request);

    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      PROBLEM_JSON_CONTENT_TYPE,
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ type: PROBLEM_TYPE.unexpectedError }),
    );
  });

  it('handles zod validation exception in HttpProblemDetailsFilter', () => {
    const filter = new HttpProblemDetailsFilter();
    const { host, response } = buildHost(request);
    const exception = new BadRequestException() as BadRequestException & {
      getZodError: () => unknown;
    };
    exception.getZodError = () => ({
      issues: [{ path: ['name'], message: 'Required', code: 'invalid_type' }],
    });

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PROBLEM_TYPE.validationError,
        errors: [{ path: 'name', message: 'Required', code: 'invalid_type' }],
      }),
    );
  });

  it('omits caused_by when NODE_ENV is not development', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host, response } = buildHost(request);

    process.env = { ...envSnapshot, NODE_ENV: 'production' };

    filter.catch(new Error('boom'), host);

    const [payload] = response.json.mock.calls[0] as [Record<string, unknown>];
    expect(payload['caused_by']).toBeUndefined();
  });

  it('omits caused_by in development when exception is not an Error', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host, response } = buildHost(request);

    process.env = { ...envSnapshot, NODE_ENV: 'development' };

    filter.catch('string exception', host);

    const [payload] = response.json.mock.calls[0] as [Record<string, unknown>];
    expect(payload['caused_by']).toBeUndefined();
  });

  it('includes caused_by stack trace for unknown exceptions in development', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host, response } = buildHost(request);

    process.env = {
      ...envSnapshot,
      NODE_ENV: 'development',
    };

    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(500);
    const [payload] = response.json.mock.calls[0] as [Record<string, unknown>];
    expect(payload).toEqual(
      expect.objectContaining({
        type: PROBLEM_TYPE.unexpectedError,
      }),
    );
    expect(payload['caused_by']).toEqual(
      expect.stringContaining('Error: boom'),
    );
  });

  it('logs structured metadata for unknown exceptions outside test mode', () => {
    const filter = new GlobalProblemDetailsFilter();
    const { host } = buildHost(request);
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    process.env = {
      ...envSnapshot,
      NODE_ENV: 'development',
    };
    delete process.env.JEST_WORKER_ID;

    filter.catch(new Error('boom'), host);

    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"unhandled_exception"'),
    );
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('"correlationId":"req-123"'),
    );

    loggerSpy.mockRestore();
  });
});
