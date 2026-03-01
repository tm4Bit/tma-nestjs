import { AsyncLocalStorage } from 'node:async_hooks';

type RequestContextStore = {
  correlationId: string;
};

const requestContext = new AsyncLocalStorage<RequestContextStore>();

export const runWithCorrelationId = <T>(
  correlationId: string,
  callback: () => T,
): T => {
  return requestContext.run({ correlationId }, callback);
};

export const getCorrelationId = (): string | undefined => {
  return requestContext.getStore()?.correlationId;
};
