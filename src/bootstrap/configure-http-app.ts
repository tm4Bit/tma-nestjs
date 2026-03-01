import type { INestApplication } from '@nestjs/common';
import {
  GlobalProblemDetailsFilter,
  HttpProblemDetailsFilter,
  ZodValidationProblemDetailsFilter,
} from '../errors/problem-details.filters';
import { correlationIdMiddleware } from '../logging/correlation-id.middleware';

export const configureHttpApp = (app: INestApplication): void => {
  app.use(correlationIdMiddleware);
  app.useGlobalFilters(
    new ZodValidationProblemDetailsFilter(),
    new HttpProblemDetailsFilter(),
    new GlobalProblemDetailsFilter(),
  );
};
