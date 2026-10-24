import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { Public } from '../common/decorators/public/public.decorator.js';
import { CurrentUser } from '../common/decorators/current-user/current-user.decorator.js';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() payload: RegisterAuthDto) {
    return this.authService.register(payload);
  }

  @Post('signin')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() payload: LoginAuthDto) {
    return this.authService.login(payload);
  }

  @Get('me')
  getUser(@CurrentUser() user: UserEntity) {
    return this.authService.me(user.id);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() payload: RefreshTokenDto) {
    return this.authService.refresh(payload);
  }

  @Post('logout')
  logout(@CurrentUser() user: UserEntity) {
    return this.authService.logout(user.sid);
  }

  @Post('logout-all')
  logoutAll(@CurrentUser() user: UserEntity) {
    return this.authService.logoutAll(user.id);
  }
}
