import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';
import { Reflector } from '@nestjs/core';

describe('GuardsGuard', () => {
  it('should be defined', () => {
    expect(new AuthGuard(new JwtService(), new Reflector())).toBeDefined();
  });
});
