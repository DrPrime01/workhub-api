import { Reflector } from '@nestjs/core';
import { ProjectRolesGuard } from './project-roles.guard.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

describe('ProjectRolesGuard', () => {
  it('should be defined', () => {
    expect(
      new ProjectRolesGuard(new Reflector(), new PrismaService()),
    ).toBeDefined();
  });
});
