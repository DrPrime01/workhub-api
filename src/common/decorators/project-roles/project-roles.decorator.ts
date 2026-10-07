import { Reflector } from '@nestjs/core';
import { ProjectRole } from '../../../generated/prisma/enums.js';

export const ProjectRoles = Reflector.createDecorator<ProjectRole[]>();
