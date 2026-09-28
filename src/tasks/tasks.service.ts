import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException('Task not found');
      if (e.code === 'P2003') throw new NotFoundException('Assignee not found');
    }
    throw e;
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, data: UpdateTaskDto) {
    if (data.assigneeId) {
      const task = await this.findOne(id);
      const member = await this.prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: data.assigneeId,
          },
        },
      });

      if (!member)
        throw new BadRequestException('Assignee must be a project member');
    }

    try {
      return await this.prisma.task.update({ where: { id }, data });
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      this.handleError(error);
    }
  }
}
