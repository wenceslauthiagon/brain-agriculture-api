import { Injectable } from '@nestjs/common';
import { SUCCESS_MESSAGES } from './common/constants/messages/success-messages.constants';
import { HealthResponse } from './common/interfaces/health-response.interface';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHealth(): Promise<HealthResponse> {
    let databaseStatus:
      | typeof SUCCESS_MESSAGES.HEALTH_DATABASE_STATUS_UP
      | typeof SUCCESS_MESSAGES.HEALTH_DATABASE_STATUS_DOWN =
      SUCCESS_MESSAGES.HEALTH_DATABASE_STATUS_UP;

    try {
      await this.prismaService.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = SUCCESS_MESSAGES.HEALTH_DATABASE_STATUS_DOWN;
    }

    return {
      status: SUCCESS_MESSAGES.HEALTH_STATUS_OK,
      service: SUCCESS_MESSAGES.HEALTH_SERVICE_NAME,
      environment:
        process.env.NODE_ENV ?? SUCCESS_MESSAGES.HEALTH_DEFAULT_ENVIRONMENT,
      timestamp: new Date().toISOString(),
      uptime: Number(process.uptime().toFixed(2)),
      checks: {
        database: databaseStatus,
      },
    };
  }
}
