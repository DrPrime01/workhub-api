import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateProjectDto,
  AddProjectMemberDto,
} from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException('Project not found');
      if (e.code === 'P2003')
        throw new BadRequestException('Owner does not exist');
    }
    throw e;
  }

  private async assertProjectExists(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  // Project CRUD
  async create(data: CreateProjectDto) {
    try {
      return await this.prisma.project.create({
        data: { ...data, members: { create: { userId: data.ownerId } } },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  findAll() {
    return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, data: UpdateProjectDto) {
    try {
      return await this.prisma.project.update({ where: { id }, data });
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.project.delete({ where: { id } });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Members CRUD
  async addProjectMember(projectId: string, data: AddProjectMemberDto) {
    await this.assertProjectExists(projectId);
    try {
      return await this.prisma.projectMember.create({
        data: { projectId, userId: data.userId },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException(
            'User is already a member of this project',
          );
        if (error.code === 'P2003')
          throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async listProjectMembers(projectId: string) {
    await this.assertProjectExists(projectId);

    return await this.prisma.projectMember.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async removeProjectMember(projectId: string, userId: string) {
    const project = await this.assertProjectExists(projectId);
    if (project.ownerId === userId)
      throw new BadRequestException("Project owner can't be removed");
    try {
      await this.prisma.projectMember.delete({
        where: { projectId_userId: { projectId, userId } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundException('User is not a member of this project');
      throw error;
    }
  }
}
