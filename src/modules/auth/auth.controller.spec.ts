import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('auth_controller', () => {
  let auth_controller: AuthController;
  let auth_service: { login: jest.Mock };

  const create_auth_service_mock = () => ({
    login: jest.fn(),
  });

  beforeEach(async () => {
    auth_service = create_auth_service_mock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: auth_service,
        },
      ],
    }).compile();

    auth_controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(auth_controller).toBeDefined();
  });

  it('TC0001 - should return_access_token_on_successful_login', async () => {
    auth_service.login.mockResolvedValue({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: '1h',
    });

    const result = await auth_controller.login({
      username: 'admin',
      password: 'password',
    });

    expect(result).toEqual({
      access_token: 'jwt-token',
      token_type: 'Bearer',
      expires_in: '1h',
    });

    expect(auth_service.login).toHaveBeenCalledTimes(1);
  });
});
