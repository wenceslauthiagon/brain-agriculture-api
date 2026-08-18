import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('jwt_strategy', () => {
  it('should be defined', () => {
    const config_service = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };

    const strategy = new JwtStrategy(
      config_service as unknown as ConfigService,
    );

    expect(strategy).toBeDefined();
  });

  it('TC0001 - should validate_token_payload_correctly', () => {
    const config_service = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    };

    const strategy = new JwtStrategy(
      config_service as unknown as ConfigService,
    );

    const result = strategy.validate({
      sub: 'admin',
      username: 'admin',
    });

    expect(config_service.getOrThrow).toHaveBeenCalledWith('JWT_SECRET');
    expect(result).toEqual({
      userId: 'admin',
      username: 'admin',
    });
  });
});
