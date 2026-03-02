declare module 'nestjs-zod' {
  import type {
    ArgumentMetadata,
    CallHandler,
    ExecutionContext,
    PipeTransform,
  } from '@nestjs/common';
  import type { Observable } from 'rxjs';
  import type { z } from 'zod';

  export class ZodValidationPipe implements PipeTransform {
    constructor(schemaOrDto?: unknown);
    transform(value: unknown, metadata: ArgumentMetadata): unknown;
  }

  export function createZodDto<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
  ): {
    new (): z.infer<TSchema>;
  };

  export function ZodResponse<TSchema extends z.ZodTypeAny>(options: {
    status?: number;
    description?: string;
    type: { new (): z.infer<TSchema> };
  }): MethodDecorator;

  export function ZodResponse<TSchema extends z.ZodTypeAny>(options: {
    status?: number;
    description?: string;
    type: [{ new (): z.infer<TSchema> }];
  }): MethodDecorator;

  export class ZodSerializerInterceptor {
    constructor(reflector: unknown);
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<unknown>;
  }

  export function cleanupOpenApiDoc<TDocument>(doc: TDocument): TDocument;
}
