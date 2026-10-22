import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async update(userId: string, id: string, data: UpdateCommentDto) {
    try {
      const comment = await this.findOne(id);
      if (comment.authorId !== userId) throw new ForbiddenException();
      return this.prisma.comment.update({ where: { id }, data });
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(userId: string, id: string) {
    try {
      const comment = await this.findOne(id);
      if (comment.authorId !== userId) throw new ForbiddenException();
      await this.prisma.comment.delete({ where: { id } });
    } catch (error) {
      this.handleError(error);
    }
  }
}
