import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CreateCommentDto } from '../comments/dto/create-comment.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException('Task not found');
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

  // Comments CR

  async addComment(taskId: string, data: CreateCommentDto) {
    const task = await this.findOne(taskId);

    // Only project members can comment on a task

    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: task.projectId, userId: data.authorId },
      },
    });
    if (!member)
      throw new BadRequestException('Only project members can comment');

    return await this.prisma.comment.create({ data: { ...data, taskId } });
  }

  async getComments(taskId: string) {
    await this.findOne(taskId);

    return await this.prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }
}
