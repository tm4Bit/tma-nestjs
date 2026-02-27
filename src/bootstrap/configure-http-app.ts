import type { INestApplication } from '@nestjs/common';
import {
  GlobalProblemDetailsFilter,
  HttpProblemDetailsFilter,
  ZodValidationProblemDetailsFilter,
} from '../errors/problem-details.filters.js';

export const configureHttpApp = (app: INestApplication): void => {
  app.useGlobalFilters(
    new ZodValidationProblemDetailsFilter(),
    new HttpProblemDetailsFilter(),
    new GlobalProblemDetailsFilter(),
  );
};
