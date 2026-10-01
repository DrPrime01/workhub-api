import { createHash, randomBytes } from 'crypto';
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

export const hashToken = (token: string) => {
  return createHash('sha256').update(token).digest('hex');
};

export const generateRefreshTokenAndHash = () => {
  const refreshToken = randomBytes(32).toString('base64url');
  const tokenHash = hashToken(refreshToken);

  return { refreshToken, tokenHash };
};
