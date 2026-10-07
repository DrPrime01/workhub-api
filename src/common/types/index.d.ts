import { UserRole } from '../../generated/prisma/enums.ts';

export {};

declare global {
  interface UserEntity {
    id: string;
    sid: string;
    role: UserRole;
  }
}
