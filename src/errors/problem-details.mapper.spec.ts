import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import {
  buildDatabaseProblemDetails,
  buildHttpProblemDetails,
  buildUnexpectedProblemDetails,
  buildValidationProblemDetails,
  classifyDatabaseError,
} from './problem-details.mapper.js';
import { PROBLEM_TYPE } from './problem-details.js';

describe('problem-details.mapper', () => {
  const request = {
    originalUrl: '/blog-posts/1',
    url: '/blog-posts/1',
  } as Request;

  it('maps HttpException to RFC 7807 fields', () => {
    const exception = new NotFoundException('Blog post not found');
    const result = buildHttpProblemDetails(exception, request);

    expect(result).toEqual({
      type: PROBLEM_TYPE.httpException,
      title: 'Not Found',
      status: 404,
      detail: 'Blog post not found',
      instance: '/blog-posts/1',
    });
  });

  it('maps zod validation error with errors extension', () => {
    const exception = new BadRequestException() as BadRequestException & {
      getZodError: () => unknown;
    };
    exception.getZodError = () => ({
      issues: [
        {
          path: ['title'],
          message: 'String must contain at least 1 character(s)',
          code: 'too_small',
        },
      ],
    });

    const result = buildValidationProblemDetails(exception, request);

    expect(result.type).toBe(PROBLEM_TYPE.validationError);
    expect(result.status).toBe(400);
    expect(result.detail).toBe('Validation failed');
    expect(result.errors).toEqual([
      {
        path: 'title',
        message: 'String must contain at least 1 character(s)',
        code: 'too_small',
      },
    ]);
  });

  it('classifies duplicate key as conflict', () => {
    expect(classifyDatabaseError({ code: 'ER_DUP_ENTRY' })).toBe('conflict');
    expect(classifyDatabaseError({ code: 'ER_DUP_KEY' })).toBe('conflict');
    expect(classifyDatabaseError({ errno: 1062 })).toBe('conflict');
  });

  it('classifies transient database failures as unavailable', () => {
    expect(classifyDatabaseError({ code: 'ETIMEDOUT' })).toBe('unavailable');
    expect(classifyDatabaseError({ code: 'ECONNREFUSED' })).toBe('unavailable');
    expect(classifyDatabaseError({ code: 'EHOSTUNREACH' })).toBe('unavailable');
    expect(classifyDatabaseError({ code: 'PROTOCOL_CONNECTION_LOST' })).toBe(
      'unavailable',
    );
    expect(
      classifyDatabaseError({ code: 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR' }),
    ).toBe('unavailable');
    expect(classifyDatabaseError({ name: 'KnexTimeoutError' })).toBe(
      'unavailable',
    );
  });

  it('classifies non-database-like values as unknown', () => {
    expect(classifyDatabaseError(undefined)).toBe('unknown');
    expect(classifyDatabaseError('boom')).toBe('unknown');
    expect(classifyDatabaseError({ code: 'UNKNOWN_DB_ERROR' })).toBe('unknown');
  });

  it('maps database conflict to 409 problem details', () => {
    const result = buildDatabaseProblemDetails(
      { code: 'ER_DUP_ENTRY' },
      request,
    );

    expect(result).toEqual({
      category: 'conflict',
      status: 409,
      title: 'Conflict',
      detail: 'Database constraint conflict',
      type: PROBLEM_TYPE.databaseConflict,
      instance: '/blog-posts/1',
    });
  });

  it('maps unknown database error to internal error descriptor', () => {
    const result = buildDatabaseProblemDetails(
      { code: 'UNKNOWN_DB_ERROR' },
      request,
    );

    expect(result).toEqual({
      category: 'unknown',
      status: 500,
      title: 'Internal Server Error',
      detail: 'An unexpected database error occurred',
      type: PROBLEM_TYPE.databaseError,
      instance: '/blog-posts/1',
    });
  });

  it('maps unavailable database error to 503 problem details', () => {
    const result = buildDatabaseProblemDetails(
      { code: 'PROTOCOL_CONNECTION_LOST' },
      request,
    );

    expect(result).toEqual({
      category: 'unavailable',
      status: 503,
      title: 'Service Unavailable',
      detail: 'Database is temporarily unavailable',
      type: PROBLEM_TYPE.databaseUnavailable,
      instance: '/blog-posts/1',
    });
  });

  it('builds unexpected problem details', () => {
    const result = buildUnexpectedProblemDetails(request);

    expect(result).toEqual({
      type: PROBLEM_TYPE.unexpectedError,
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
      instance: '/blog-posts/1',
    });
  });
});
