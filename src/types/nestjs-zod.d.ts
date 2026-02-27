declare module 'nestjs-zod' {
  import type { ArgumentMetadata, PipeTransform } from '@nestjs/common';
  import type { z } from 'zod';

  export class ZodValidationPipe implements PipeTransform {
    transform(value: unknown, metadata: ArgumentMetadata): unknown;
  }

  export function createZodDto<TSchema extends z.ZodTypeAny>(
    schema: TSchema,
  ): {
    new (): z.infer<TSchema>;
  };
}
