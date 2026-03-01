import type { INestApplication } from '@nestjs/common';
import { configureHttpApp } from './configure-http-app';
import {
  GlobalProblemDetailsFilter,
  HttpProblemDetailsFilter,
  ZodValidationProblemDetailsFilter,
} from '../errors/problem-details.filters';
import { correlationIdMiddleware } from '../logging/correlation-id.middleware';

describe('configureHttpApp', () => {
  it('registers correlation middleware and problem-details filters in expected order', () => {
    const use = jest.fn();
    const useGlobalFilters = jest.fn();
    const app = {
      use,
      useGlobalFilters,
    } as unknown as INestApplication;

    configureHttpApp(app);

    expect(use).toHaveBeenCalledTimes(1);
    expect(use).toHaveBeenCalledWith(correlationIdMiddleware);

    expect(useGlobalFilters).toHaveBeenCalledTimes(1);

    const [zodFilter, httpFilter, globalFilter] = useGlobalFilters.mock
      .calls[0] as [unknown, unknown, unknown];

    expect(zodFilter).toBeInstanceOf(ZodValidationProblemDetailsFilter);
    expect(httpFilter).toBeInstanceOf(HttpProblemDetailsFilter);
    expect(globalFilter).toBeInstanceOf(GlobalProblemDetailsFilter);
  });
});
