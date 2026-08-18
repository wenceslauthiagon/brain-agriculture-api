import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

describe('dashboard_service', () => {
  let service: DashboardService;
  let prisma: {
    farm: {
      count: jest.Mock;
      aggregate: jest.Mock;
      groupBy: jest.Mock;
    };
    farmCrop: {
      groupBy: jest.Mock;
    };
  };

  const create_prisma_service_mock = () => ({
    farm: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    farmCrop: {
      groupBy: jest.fn(),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: create_prisma_service_mock(),
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('TC0001 - should build dashboard_summary from active_farms_and_crops', async () => {
    prisma.farm.count.mockResolvedValue(12);
    prisma.farm.aggregate.mockResolvedValue({
      _sum: {
        totalArea: new Prisma.Decimal('10500'),
        arableArea: new Prisma.Decimal('8000'),
        vegetationArea: new Prisma.Decimal('2500'),
      },
    });
    prisma.farm.groupBy.mockResolvedValue([
      {
        state: 'MT',
        _count: { _all: 7 },
        _sum: { totalArea: new Prisma.Decimal('6400') },
      },
      {
        state: 'SP',
        _count: { _all: 5 },
        _sum: { totalArea: new Prisma.Decimal('4100') },
      },
    ]);
    prisma.farmCrop.groupBy.mockResolvedValue([
      { crop: 'SOYBEAN', _count: { _all: 5 } },
      { crop: 'CORN', _count: { _all: 3 } },
    ]);

    const result = await service.getDashboard();

    expect(result).toEqual({
      total_farms: 12,
      total_hectares: 10500,
      land_use: {
        arable_area: 8000,
        vegetation_area: 2500,
      },
      charts: {
        by_state: [
          { state: 'MT', farms: 7, total_area: 6400 },
          { state: 'SP', farms: 5, total_area: 4100 },
        ],
        by_crop: [
          { crop: 'SOYBEAN', farms: 5 },
          { crop: 'CORN', farms: 3 },
        ],
      },
    });
  });

  it('TC0002 - should handle null_area_values_as_zero', async () => {
    prisma.farm.count.mockResolvedValue(0);
    prisma.farm.aggregate.mockResolvedValue({
      _sum: {
        totalArea: null,
        arableArea: null,
        vegetationArea: null,
      },
    });
    prisma.farm.groupBy.mockResolvedValue([]);
    prisma.farmCrop.groupBy.mockResolvedValue([]);

    await expect(service.getDashboard()).resolves.toEqual({
      total_farms: 0,
      total_hectares: 0,
      land_use: {
        arable_area: 0,
        vegetation_area: 0,
      },
      charts: {
        by_state: [],
        by_crop: [],
      },
    });
  });

  it('TC0003 - should normalize numeric_values_from_decimal_or_number_when_present', async () => {
    prisma.farm.count.mockResolvedValue(1);
    prisma.farm.aggregate.mockResolvedValue({
      _sum: {
        totalArea: 1500,
        arableArea: 900,
        vegetationArea: 600,
      },
    });
    prisma.farm.groupBy.mockResolvedValue([
      {
        state: 'GO',
        _count: { _all: 1 },
        _sum: { totalArea: 1500 },
      },
    ]);
    prisma.farmCrop.groupBy.mockResolvedValue([
      { crop: 'CORN', _count: { _all: 2 } },
    ]);

    await expect(service.getDashboard()).resolves.toMatchObject({
      total_farms: 1,
      total_hectares: 1500,
      land_use: {
        arable_area: 900,
        vegetation_area: 600,
      },
      charts: {
        by_state: [{ state: 'GO', farms: 1, total_area: 1500 }],
        by_crop: [{ crop: 'CORN', farms: 2 }],
      },
    });
  });
});
