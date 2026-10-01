import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard.js';

describe('GuardsGuard', () => {
  it('should be defined', () => {
    expect(new AuthGuard(new JwtService())).toBeDefined();
  });
});
