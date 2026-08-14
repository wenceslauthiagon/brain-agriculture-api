import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let configService: { get: jest.Mock };
  let jwtService: { signAsync: jest.Mock };
  let compareMock: jest.Mock;
  const passwordHash =
    '$2b$10$8ZxB2vTEAuANV8sM.2ZIl.YvzwQ6wgYfg38P3Br8/C/PEdh1N0.ji';

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          AUTH_USERNAME: 'admin',
          AUTH_PASSWORD_HASH: passwordHash,
          JWT_EXPIRES_IN: '1h',
        };

        return values[key];
      }),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    compareMock = compare as jest.Mock;
    compareMock.mockReset();

    authService = new AuthService(
      configService as unknown as ConfigService,
      jwtService as unknown as JwtService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('TC0001 - Should generate JWT when credentials are valid', async () => {
    compareMock.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await authService.login({
      username: 'admin',
      password: 'valid-password',
    });

    expect(result).toEqual({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: '1h',
    });
  });

  it('TC0002 - Should throw UnauthorizedException when credentials are invalid', async () => {
    compareMock.mockResolvedValue(false);

    try {
      await authService.login({
        username: 'admin',
        password: 'invalid-password',
      });

      fail('Expected AuthService.login to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });
});
