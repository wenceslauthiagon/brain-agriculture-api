import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthResponse } from './common/interfaces/health-response.interface';

describe('app_controller', () => {
  let app_controller: AppController;
  let get_health_mock: jest.Mock<Promise<HealthResponse>, []>;

  const mock_health_response: HealthResponse = {
    status: 'ok',
    service: 'brain-agriculture-api',
    environment: 'development',
    timestamp: '2026-08-13T16:57:00.000Z',
    uptime: 124.52,
    checks: {
      database: 'up',
    },
  };

  const create_app_service_mock = () => ({
    getHealth: jest.fn<Promise<HealthResponse>, []>(),
  });

  beforeEach(async () => {
    get_health_mock = create_app_service_mock().getHealth;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHealth: get_health_mock,
          },
        },
      ],
    }).compile();

    app_controller = module.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return api_health_status', async () => {
      get_health_mock.mockResolvedValue(mock_health_response);

      await expect(app_controller.getHealth()).resolves.toEqual(
        mock_health_response,
      );
      expect(get_health_mock).toHaveBeenCalledTimes(1);
    });

    it('TC0002 - should return the_health_response_as_is', async () => {
      const response: HealthResponse = {
        status: 'ok',
        service: 'brain-agriculture-api',
        environment: 'production',
        timestamp: '2026-08-14T00:00:00.000Z',
        uptime: 15.5,
        checks: { database: 'down' },
      };

      get_health_mock.mockResolvedValue(response);

      await expect(app_controller.getHealth()).resolves.toEqual(response);
    });
  });
});
