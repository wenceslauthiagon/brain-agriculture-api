import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { HealthResponse } from './common/interfaces/health-response.interface';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiOkResponse({
    description: 'Saúde da aplicação retornada com sucesso',
    schema: {
      example: {
        status: 'ok',
        service: 'brain-agriculture-api',
        environment: 'development',
        timestamp: '2026-08-14T12:00:00.000Z',
        dependencies: {
          database: 'up',
        },
      },
    },
  })
  @Get('health')
  async getHealth(): Promise<HealthResponse> {
    return this.appService.getHealth();
  }
}
