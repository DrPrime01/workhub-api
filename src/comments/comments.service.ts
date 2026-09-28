import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException('Comment not found');
    }
    throw e;
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(id: string, data: UpdateCommentDto) {
    // Check if the updater is a project member. Postpone until authorization phase

    try {
      return await this.prisma.comment.update({ where: { id }, data });
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.comment.delete({ where: { id } });
    } catch (error) {
      this.handleError(error);
    }
  }
}
