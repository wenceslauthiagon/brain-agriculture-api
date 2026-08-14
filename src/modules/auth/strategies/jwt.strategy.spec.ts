import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('should be defined', () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };

    const strategy = new JwtStrategy(configService as unknown as ConfigService);

    expect(strategy).toBeDefined();
  });

  it('TC0001 - Should validate token payload correctly', () => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };

    const strategy = new JwtStrategy(configService as unknown as ConfigService);

    const result = strategy.validate({
      sub: 'admin',
      username: 'admin',
    });

    expect(configService.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
    expect(result).toEqual({
      userId: 'admin',
      username: 'admin',
    });
  });
});
