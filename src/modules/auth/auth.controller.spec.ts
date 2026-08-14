import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('TC0001 - Should return access token on successful login', async () => {
    authService.login.mockResolvedValue({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: '1h',
    });

    const result = await authController.login({
      username: 'admin',
      password: 'password',
    });

    expect(result).toEqual({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: '1h',
    });

    expect(authService.login).toHaveBeenCalledTimes(1);
  });
});
