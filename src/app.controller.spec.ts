import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthResponse } from './common/interfaces/health-response.interface';

describe('AppController', () => {
  let appController: AppController;
  let getHealthMock: jest.Mock<Promise<HealthResponse>, []>;

  const mockHealthResponse: HealthResponse = {
    status: 'ok',
    service: 'brain-agriculture-api',
    environment: 'development',
    timestamp: '2026-08-13T16:57:00.000Z',
    uptime: 124.52,
    checks: {
      database: 'up',
    },
  };

  beforeEach(async () => {
    getHealthMock = jest.fn<Promise<HealthResponse>, []>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHealth: getHealthMock,
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return API health status', async () => {
      getHealthMock.mockResolvedValue(mockHealthResponse);

      await expect(appController.getHealth()).resolves.toEqual(
        mockHealthResponse,
      );
      expect(getHealthMock).toHaveBeenCalledTimes(1);
    });
  });
});
