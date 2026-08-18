import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('dashboard_controller', () => {
  let controller: DashboardController;
  let dashboard_service: jest.Mocked<Pick<DashboardService, 'getDashboard'>>;

  const create_dashboard_service_mock = () => ({
    getDashboard: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: create_dashboard_service_mock(),
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    dashboard_service = module.get(DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('TC0001 - should return dashboard_indicators', async () => {
    const mock_dashboard = {
      total_farms: 12,
      total_hectares: 10500,
      land_use: {
        arable_area: 8000,
        vegetation_area: 2500,
      },
      charts: {
        by_state: [{ state: 'MT', farms: 7, total_area: 6400 }],
        by_crop: [{ crop: 'SOYBEAN', farms: 5 }],
      },
    };

    dashboard_service.getDashboard.mockResolvedValue(mock_dashboard);

    const result = await controller.getDashboard();

    expect(dashboard_service.getDashboard).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      message: 'Dashboard fetched successfully',
      data: mock_dashboard,
    });
  });
});
