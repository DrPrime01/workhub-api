import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma, ProjectRole } from '../generated/prisma/client.js';
import { CreateCommentDto } from '../comments/dto/create-comment.dto.js';
import { ilike, paginate } from '../common/helper.js';
import { COMMENT_SORT_FIELDS } from './dto/comment-list-query.dto.js';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException('Task not found');
    }
    throw e;
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });
    if (!member) throw new ForbiddenException();
    return task;
  }

  async update(userId: string, id: string, data: UpdateTaskDto) {
    const task = await this.findOne(userId, id); // 404 / 403
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });
    const isOwner = member!.role === ProjectRole.OWNER;
    const isAssignee = task.assigneeId === userId;

    if (data.assigneeId !== undefined) {
      if (!isOwner)
        throw new ForbiddenException('Only the owner can assign tasks');
      if (data.assigneeId) {
        const assignee = await this.prisma.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId: task.projectId,
              userId: data.assigneeId,
            },
          },
        });
        if (!assignee)
          throw new BadRequestException('Assignee must be a project member');
      }
    }

    if (data.status && !isOwner && !isAssignee)
      throw new ForbiddenException(
        'Only the owner or assignee can update status',
      );

    return this.prisma.task.update({ where: { id }, data });
  }

  async remove(userId: string, id: string) {
    const task = await this.findOne(userId, id); // 404 / 403
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId } },
    });
    const isOwner = member!.role === ProjectRole.OWNER;
    if (!isOwner) throw new ForbiddenException();
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      this.handleError(error);
    }
  }

  // Comments CR

  async addComment(taskId: string, userId: string, data: CreateCommentDto) {
    await this.findOne(userId, taskId);

    return await this.prisma.comment.create({
      data: { content: data.content, authorId: userId, taskId },
    });
  }

  async getComments(
    userId: string,
    taskId: string,
    page: number,
    limit: number,
    sortBy: (typeof COMMENT_SORT_FIELDS)[number],
    order: Prisma.SortOrder,
    search?: string,
  ) {
    await this.findOne(userId, taskId);

    const where: Prisma.CommentWhereInput = {
      taskId,
      ...(search && { content: ilike(search) }),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where,
        orderBy: [{ [sortBy]: order }, { id: 'desc' }],
        include: { author: { select: { id: true, name: true, email: true } } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }
}
