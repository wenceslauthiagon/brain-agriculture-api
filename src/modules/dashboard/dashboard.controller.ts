import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse as StandardApiResponse } from '../../common/interfaces/api-response.interface';
import { makeApiResponse } from '../../common/utils/api-response.util';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Buscar indicadores do dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Indicadores carregados com sucesso',
    schema: {
      example: {
        message: 'Dashboard fetched successfully',
        data: {
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
        },
      },
    },
  })
  @Get()
  async getDashboard(): Promise<StandardApiResponse<DashboardResponseDto>> {
    const dashboard = await this.dashboardService.getDashboard();
    return makeApiResponse('Dashboard fetched successfully', dashboard);
  }
}
