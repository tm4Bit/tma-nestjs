import type { INestApplication } from '@nestjs/common';
import { configureHttpApp } from './configure-http-app.js';
import {
  GlobalProblemDetailsFilter,
  HttpProblemDetailsFilter,
  ZodValidationProblemDetailsFilter,
} from '../errors/problem-details.filters.js';

describe('configureHttpApp', () => {
  it('registers problem-details filters in expected order', () => {
    const useGlobalFilters = jest.fn();
    const app = {
      useGlobalFilters,
    } as unknown as INestApplication;

    configureHttpApp(app);

    expect(useGlobalFilters).toHaveBeenCalledTimes(1);

    const [zodFilter, httpFilter, globalFilter] = useGlobalFilters.mock
      .calls[0] as [unknown, unknown, unknown];

    expect(zodFilter).toBeInstanceOf(ZodValidationProblemDetailsFilter);
    expect(httpFilter).toBeInstanceOf(HttpProblemDetailsFilter);
    expect(globalFilter).toBeInstanceOf(GlobalProblemDetailsFilter);
  });
});
