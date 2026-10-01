import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';

import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../generated/prisma/enums.js';
import { generateRefreshTokenAndHash, hashToken } from '../common/helper.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async getToken(payload: {
    sub: string;
    sid: string;
    role: UserRole;
  }) {
    return await this.jwtService.signAsync(payload);
  }

  async login(data: LoginAuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const { passwordHash, ...safeUser } = user;

    const isPassword = await bcrypt.compare(data.password, passwordHash);
    if (!isPassword)
      throw new UnauthorizedException('Invalid email or password');

    const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
    const futureDate = new Date(Date.now() + THIRTY_DAYS_IN_MS);

    const { refreshToken, tokenHash } = generateRefreshTokenAndHash();
    const session = await this.prisma.session.create({
      data: { userId: user.id, expiresAt: futureDate, tokenHash },
    });
    const accessToken = await this.getToken({
      sub: user.id,
      sid: session.id,
      role: user.role,
    });

    return { data: { ...safeUser, accessToken, refreshToken } };
  }

  async register(data: RegisterAuthDto) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    await this.usersService.create({
      name: data.name,
      email: data.email,
      passwordHash: hashedPassword,
    });

    return await this.login({ email: data.email, password: data.password });
  }

  async me(id: string) {
    return await this.usersService.getOne(id);
  }

  async refresh({ refreshToken }: RefreshTokenDto) {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: {
        user: {
          omit: {
            passwordHash: true,
          },
        },
      },
    });
    if (!session || session.expiresAt < new Date())
      throw new UnauthorizedException();

    const { count } = await this.prisma.session.updateMany({
      where: { id: session.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (count === 0) {
      await this.prisma.session.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException();
    }

    const { refreshToken: newRefreshToken, tokenHash } =
      generateRefreshTokenAndHash();
    const newSession = await this.prisma.session.create({
      data: { userId: session.userId, expiresAt: session.expiresAt, tokenHash },
    });
    const accessToken = await this.getToken({
      sub: session.user.id,
      sid: newSession.id,
      role: session.user.role,
    });

    return {
      data: { ...session.user, accessToken, refreshToken: newRefreshToken },
    };
  }

  async logout(id: string) {
    await this.prisma.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
