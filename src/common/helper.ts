export const paginate = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
) => ({
  data,
  meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
});
