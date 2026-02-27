import { ZodValidationPipe } from 'nestjs-zod';

export const zodBodyValidationPipe = new ZodValidationPipe();
export const zodQueryValidationPipe = new ZodValidationPipe();
export const zodParamsValidationPipe = new ZodValidationPipe();
