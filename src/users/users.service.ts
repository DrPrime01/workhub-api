import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserDto } from './dto/update-user-dto.js';
import { Prisma } from '../generated/prisma/client.js';
import { ilike, paginate } from '../common/helper.js';
import { USER_SORT_FIELDS } from './dto/user-list-query.dto.js';

@Injectable()
export class UsersService {
  constructor(protected readonly prisma: PrismaService) {}

  private handleError(e: unknown): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') throw new NotFoundException(`User not found`);
      if (e.code === 'P2002')
        throw new ConflictException('Email is already in use');
    }
    throw e;
  }

  async getAll(
    page: number,
    limit: number,
    sortBy: (typeof USER_SORT_FIELDS)[number],
    order: Prisma.SortOrder,
    search?: string,
  ) {
    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [{ name: ilike(search) }, { email: ilike(search) }],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: [{ [sortBy]: order }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        omit: {
          passwordHash: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(data, total, page, limit);
  }

  async getOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: {
        passwordHash: true,
      },
    });
    if (!user) throw new NotFoundException(`User not found`);

    return user;
  }

  async create(data: Prisma.UserCreateInput) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, body: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: body,
        omit: {
          passwordHash: true,
        },
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      this.handleError(error);
    }
  }
}
