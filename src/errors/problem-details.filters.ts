import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  buildDatabaseProblemDetails,
  buildHttpProblemDetails,
  buildUnexpectedProblemDetails,
  buildValidationProblemDetails,
} from './problem-details.mapper.js';
import {
  createProblemDetails,
  PROBLEM_JSON_CONTENT_TYPE,
} from './problem-details.js';

type ZodValidationExceptionLike = BadRequestException & {
  getZodError: () => unknown;
};

const isZodValidationException = (
  exception: unknown,
): exception is ZodValidationExceptionLike => {
  return (
    exception instanceof BadRequestException &&
    !!exception &&
    typeof exception === 'object' &&
    typeof Reflect.get(exception, 'getZodError') === 'function'
  );
};

const getHttpContext = (
  host: ArgumentsHost,
): { request: Request; response: Response } => {
  const http = host.switchToHttp();
  return {
    request: http.getRequest<Request>(),
    response: http.getResponse<Response>(),
  };
};

const sendProblem = (
  response: Response,
  payload: ReturnType<typeof createProblemDetails>,
): void => {
  response
    .status(payload.status)
    .setHeader('Content-Type', PROBLEM_JSON_CONTENT_TYPE)
    .json(payload);
};

@Catch(HttpException)
export class HttpProblemDetailsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const { request, response } = getHttpContext(host);

    if (isZodValidationException(exception)) {
      const payload = buildValidationProblemDetails(exception, request);
      sendProblem(response, payload);
      return;
    }

    const payload = buildHttpProblemDetails(exception, request);
    sendProblem(response, payload);
  }
}

@Catch(BadRequestException)
export class ZodValidationProblemDetailsFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost): void {
    const { request, response } = getHttpContext(host);

    if (!isZodValidationException(exception)) {
      const payload = buildHttpProblemDetails(exception, request);
      sendProblem(response, payload);
      return;
    }

    const payload = buildValidationProblemDetails(exception, request);
    sendProblem(response, payload);
  }
}

@Catch()
export class GlobalProblemDetailsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalProblemDetailsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const { request, response } = getHttpContext(host);

    if (isZodValidationException(exception)) {
      const payload = buildValidationProblemDetails(exception, request);
      sendProblem(response, payload);
      return;
    }

    if (exception instanceof HttpException) {
      const payload = buildHttpProblemDetails(exception, request);
      sendProblem(response, payload);
      return;
    }

    const dbProblem = buildDatabaseProblemDetails(exception, request);

    if (dbProblem.category !== 'unknown') {
      const payload = createProblemDetails(dbProblem);
      sendProblem(response, payload);
      return;
    }

    if (!process.env.JEST_WORKER_ID && process.env.NODE_ENV !== 'test') {
      this.logger.error('Unhandled exception', exception as Error);
    }
    const payload = buildUnexpectedProblemDetails(request);
    sendProblem(response, payload);
  }
}
