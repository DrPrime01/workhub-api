import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../generated/prisma/enums.js';

export const Roles = Reflector.createDecorator<UserRole[]>();
