import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth/auth.guard.js';
import { RolesGuard } from './common/guards/roles/roles.guard.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Keyv } from 'keyv';
import { createKeyv } from '@keyv/redis';
import { KeyvCacheableMemory } from 'cacheable';
import Joi from 'joi';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'workhub-api',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().port().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET_KEY: Joi.string().min(32).required(),
        REDIS_URL: Joi.string()
          .uri({ scheme: ['redis', 'rediss'] })
          .required(),
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 100,
        },
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        stores: [
          new Keyv({
            store: new KeyvCacheableMemory({ ttl: 60_000, lruSize: 5_000 }),
          }),
          createKeyv(configService.getOrThrow<string>('REDIS_URL')),
        ],
        ttl: 30_000,
      }),
    }),
    PrismaModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
