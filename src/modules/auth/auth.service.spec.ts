import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('auth_service', () => {
  let auth_service: AuthService;
  let config_service: { get: jest.Mock };
  let jwt_service: { signAsync: jest.Mock };
  let compare_mock: jest.Mock;
  const password_hash =
    '$2b$10$8ZxB2vTEAuANV8sM.2ZIl.YvzwQ6wgYfg38P3Br8/C/PEdh1N0.ji';

  const create_config_service_mock = () => ({
    get: jest.fn((key: string) => {
      const values: Record<string, string> = {
        AUTH_USERNAME: 'admin',
        AUTH_PASSWORD_HASH: password_hash,
        JWT_EXPIRES_IN: '1h',
      };

      return values[key];
    }),
  });

  const create_jwt_service_mock = () => ({
    signAsync: jest.fn(),
  });

  beforeEach(() => {
    config_service = create_config_service_mock();
    jwt_service = create_jwt_service_mock();

    compare_mock = compare as jest.Mock;
    compare_mock.mockReset();

    auth_service = new AuthService(
      config_service as unknown as ConfigService,
      jwt_service as unknown as JwtService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(auth_service).toBeDefined();
  });

  it('TC0001 - should generate_jwt_when_credentials_are_valid', async () => {
    compare_mock.mockResolvedValue(true);
    jwt_service.signAsync.mockResolvedValue('jwt-token');

    const result = await auth_service.login({
      username: 'admin',
      password: 'valid-password',
    });

    expect(result).toEqual({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: '1h',
    });
  });

  it('TC0002 - should throw_unauthorized_exception_when_credentials_are_invalid', async () => {
    compare_mock.mockResolvedValue(false);

    try {
      await auth_service.login({
        username: 'admin',
        password: 'invalid-password',
      });

      fail('Expected AuthService.login to throw an error');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
    }
  });

  it('TC0003 - should throw_unauthorized_exception_when_env_config_is_missing', async () => {
    config_service.get = jest.fn((key: string) => {
      const values: Record<string, string | undefined> = {
        AUTH_USERNAME: undefined,
        AUTH_PASSWORD_HASH: undefined,
        JWT_EXPIRES_IN: '1h',
      };

      return values[key];
    });

    await expect(
      auth_service.login({ username: 'admin', password: 'valid-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('TC0004 - should throw_unauthorized_exception_when_username_does_not_match_the_configured_one', async () => {
    await expect(
      auth_service.login({
        username: 'other-user',
        password: 'valid-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('TC0005 - should use_the_default_expiry_when_jwt_expires_in_is_not_configured', async () => {
    config_service.get = jest.fn((key: string) => {
      const values: Record<string, string | undefined> = {
        AUTH_USERNAME: 'admin',
        AUTH_PASSWORD_HASH: password_hash,
        JWT_EXPIRES_IN: undefined,
      };

      return values[key];
    });

    compare_mock.mockResolvedValue(true);
    jwt_service.signAsync.mockResolvedValue('jwt-token');

    await expect(
      auth_service.login({ username: 'admin', password: 'valid-password' }),
    ).resolves.toEqual({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: '1h',
    });
  });

  it('TC0006 - should throw_unauthorized_exception_when_password_hash_is_missing', async () => {
    config_service.get = jest.fn((key: string) => {
      const values: Record<string, string | undefined> = {
        AUTH_USERNAME: 'admin',
        AUTH_PASSWORD_HASH: undefined,
        JWT_EXPIRES_IN: '1h',
      };

      return values[key];
    });

    await expect(
      auth_service.login({ username: 'admin', password: 'valid-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
