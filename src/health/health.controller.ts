import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service.js';
import { Public } from '../common/decorators/public/public.decorator.js';
import { SkipThrottle } from '@nestjs/throttler';

@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly indicator: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () =>
        this.indicator
          .check('database')
          .attempt(async () => {
            await this.prisma.$queryRaw`SELECT 1`;
          })
          .withTimeout(1_500),
    ]);
  }
}
