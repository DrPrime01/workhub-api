import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterAuthDto } from './dto/register-auth.dto.js';
import { LoginAuthDto } from './dto/login-auth.dto.js';
import { AuthGuard } from './guards/auth.guard.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';

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
  register(@Body() payload: RegisterAuthDto) {
    return this.authService.register(payload);
  }

  @Post('signin')
  login(@Body() payload: LoginAuthDto) {
    return this.authService.login(payload);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getUser(@Req() req: UserRequest) {
    return this.authService.me(req.user.id);
  }

  @Post('refresh')
  refresh(@Body() payload: RefreshTokenDto) {
    return this.authService.refresh(payload);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Req() req: UserRequest) {
    return this.authService.logout(req.user.sid);
  }

  @UseGuards(AuthGuard)
  @Post('logout-all')
  logoutAll(@Req() req: UserRequest) {
    return this.authService.logoutAll(req.user.id);
  }
}
