export const PROBLEM_JSON_CONTENT_TYPE = 'application/problem+json';

const PROBLEM_TYPE_BASE_URI = 'https://api.ovlk.local/problems';

export const PROBLEM_TYPE = {
  httpException: `${PROBLEM_TYPE_BASE_URI}/http-exception`,
  validationError: `${PROBLEM_TYPE_BASE_URI}/validation-error`,
  unexpectedError: `${PROBLEM_TYPE_BASE_URI}/unexpected-error`,
  databaseConflict: `${PROBLEM_TYPE_BASE_URI}/database-conflict`,
  databaseUnavailable: `${PROBLEM_TYPE_BASE_URI}/database-unavailable`,
  databaseError: `${PROBLEM_TYPE_BASE_URI}/database-error`,
} as const;

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Array<{ path: string; message: string; code?: string }>;
  caused_by?: string;
};

export type DatabaseErrorCategory = 'conflict' | 'unavailable' | 'unknown';

type ProblemDetailsInput = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: ProblemDetails['errors'];
  caused_by?: string;
};

export const createProblemDetails = (
  input: ProblemDetailsInput,
): ProblemDetails => {
  return {
    type: input.type,
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: input.instance,
    ...(input.errors ? { errors: input.errors } : {}),
    ...(input.caused_by ? { caused_by: input.caused_by } : {}),
  };
};
