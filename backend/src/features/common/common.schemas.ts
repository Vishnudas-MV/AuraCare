import { z } from 'zod';

export const uuidSchema = z.string().uuid({ message: 'Must be a valid UUID' });

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
