import { Prisma } from '../generated/prisma/client.js';

export const paginate = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => ({
  data,
  meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
});

export const ilike = (search: string) => ({
  contains: search,
  mode: Prisma.QueryMode.insensitive,
});
