import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { Public } from '../common/decorators/public/public.decorator.js';

interface UserRequest extends Request {
  user: {
    id: string;
    sid: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() payload: RegisterAuthDto) {
    return this.authService.register(payload);
  }

  @Post('signin')
  @Public()
  login(@Body() payload: LoginAuthDto) {
    return this.authService.login(payload);
  }

  @Get('me')
  getUser(@Req() req: UserRequest) {
    return this.authService.me(req.user.id);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() payload: RefreshTokenDto) {
    return this.authService.refresh(payload);
  }

  @Post('logout')
  logout(@Req() req: UserRequest) {
    return this.authService.logout(req.user.sid);
  }

  @Post('logout-all')
  logoutAll(@Req() req: UserRequest) {
    return this.authService.logoutAll(req.user.id);
  }
}
