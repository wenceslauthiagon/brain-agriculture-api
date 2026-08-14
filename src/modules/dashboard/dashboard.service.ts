import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(): Promise<DashboardResponseDto> {
    const activeFarmWhere = {
      deletedAt: null,
      status: 'ACTIVE' as const,
    };

    const [totalFarms, totalAreas, farmsByState, cropsByFarm] =
      await Promise.all([
        this.prisma.farm.count({
          where: activeFarmWhere,
        }),
        this.prisma.farm.aggregate({
          where: activeFarmWhere,
          _sum: {
            totalArea: true,
            arableArea: true,
            vegetationArea: true,
          },
        }),
        this.prisma.farm.groupBy({
          by: ['state'],
          where: activeFarmWhere,
          _count: {
            _all: true,
          },
          _sum: {
            totalArea: true,
          },
        }),
        this.prisma.farmCrop.groupBy({
          by: ['crop'],
          where: {
            deletedAt: null,
            farm: {
              status: 'ACTIVE',
              deletedAt: null,
            },
          },
          _count: {
            _all: true,
          },
        }),
      ]);

    return {
      total_farms: totalFarms,
      total_hectares: this.toNumber(totalAreas._sum.totalArea),
      land_use: {
        arable_area: this.toNumber(totalAreas._sum.arableArea),
        vegetation_area: this.toNumber(totalAreas._sum.vegetationArea),
      },
      charts: {
        by_state: farmsByState.map((item) => ({
          state: item.state,
          farms: item._count._all,
          total_area: this.toNumber(item._sum.totalArea),
        })),
        by_crop: cropsByFarm.map((item) => ({
          crop: String(item.crop),
          farms: item._count._all,
        })),
      },
    };
  }

  private toNumber(value: Prisma.Decimal | number | null | undefined): number {
    if (!value) {
      return 0;
    }

    return Number(value);
  }
}
