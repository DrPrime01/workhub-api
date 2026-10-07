import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectRoles } from '../../decorators/project-roles/project-roles.decorator.js';
import { PrismaService } from '../../../prisma/prisma.service.js';

@Injectable()
export class ProjectRolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get(ProjectRoles, context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const projectId = request.params.projectId ?? request.params.id;
    const userId = request.user.id;
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    return !!membership && roles.includes(membership.role);
  }
}
