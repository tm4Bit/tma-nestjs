import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.string(),
  databaseVersion: z.string(),
});

export class HealthResponseDto extends createZodDto(healthResponseSchema) {}
