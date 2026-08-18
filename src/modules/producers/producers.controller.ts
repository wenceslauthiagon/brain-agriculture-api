import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiResponse as StandardApiResponse } from '../../common/interfaces/api-response.interface';
import { makeApiResponse } from '../../common/utils/api-response.util';
import { CreateCropDto } from './dto/create-crop.dto';
import { CreateFarmDto } from './dto/create-farm.dto';
import { CreateProducerDto } from './dto/create-producer.dto';
import {
  FarmCropResponse,
  FarmResponse,
  ProducerResponse,
  ProducersListResponse,
} from './interfaces/producer-response.interface';
import { UpdateProducerDto } from './dto/update-producer.dto';
import { ProducersService } from './producers.service';

@ApiTags('Producers')
@ApiBearerAuth('JWT-auth')
@Controller('producers')
export class ProducersController {
  constructor(private readonly producersService: ProducersService) {}

  @ApiOperation({ summary: 'Criar produtor rural' })
  @ApiBody({ type: CreateProducerDto })
  @ApiResponse({
    status: 201,
    description: 'Produtor criado com sucesso',
    schema: {
      example: {
        message: 'Producer created successfully',
        data: {
          id: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
          document: '12345678909',
          name: 'Joao da Silva',
        },
      },
    },
  })
  @Post()
  async create(
    @Body() dto: CreateProducerDto,
  ): Promise<StandardApiResponse<ProducerResponse>> {
    const producer = await this.producersService.create(dto);
    return makeApiResponse('Producer created successfully', producer);
  }

  @ApiOperation({ summary: 'Listar produtores' })
  @ApiQuery({ name: 'page', required: false, example: 0 })
  @ApiQuery({ name: 'pageSize', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Produtores listados com sucesso',
    schema: {
      example: {
        message: 'Producers fetched successfully',
        data: {
          records: [
            {
              id: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
              document: '12345678909',
              name: 'Joao da Silva',
              status: 'ACTIVE',
              created_at: '2026-08-14T12:00:00.000Z',
              updated_at: null,
            },
          ],
          page: 0,
          pageSize: 10,
          total_pages: 1,
          total_records: 1,
        },
      },
    },
  })
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe)
    pageSize: number,
  ): Promise<StandardApiResponse<ProducersListResponse>> {
    if (page < 0) {
      throw new BadRequestException('page must be greater than or equal to 0');
    }

    if (pageSize <= 0) {
      throw new BadRequestException(
        'pageSize must be greater than or equal to 1',
      );
    }

    const producers: ProducersListResponse =
      await this.producersService.findAll(page, pageSize);
    return makeApiResponse('Producers fetched successfully', producers);
  }

  @ApiOperation({ summary: 'Buscar produtor por id' })
  @ApiParam({ name: 'id', example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0' })
  @ApiResponse({
    status: 200,
    description: 'Produtor encontrado com sucesso',
    schema: {
      example: {
        message: 'Producer fetched successfully',
        data: {
          id: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
          document: '12345678909',
          name: 'Joao da Silva',
          status: 'ACTIVE',
          created_at: '2026-08-14T12:00:00.000Z',
          updated_at: '2026-08-14T12:00:00.000Z',
          farms: [],
        },
      },
    },
  })
  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<StandardApiResponse<ProducerResponse>> {
    const producer = await this.producersService.findOne(id);
    return makeApiResponse('Producer fetched successfully', producer);
  }

  @ApiOperation({ summary: 'Atualizar produtor' })
  @ApiParam({ name: 'id', example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0' })
  @ApiBody({ type: UpdateProducerDto })
  @ApiResponse({
    status: 200,
    description: 'Produtor atualizado com sucesso',
    schema: {
      example: {
        message: 'Producer updated successfully',
        data: {
          id: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
          document: '12345678909',
          name: 'Joao da Silva Atualizado',
          status: 'ACTIVE',
          created_at: '2026-08-14T12:00:00.000Z',
          updated_at: '2026-08-14T12:10:00.000Z',
        },
      },
    },
  })
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateProducerDto,
  ): Promise<StandardApiResponse<ProducerResponse>> {
    const producer = await this.producersService.update(id, dto);
    return makeApiResponse('Producer updated successfully', producer);
  }

  @ApiOperation({ summary: 'Remover produtor' })
  @ApiParam({ name: 'id', example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0' })
  @ApiNoContentResponse({ description: 'Produtor removido com sucesso' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    await this.producersService.remove(id);
  }

  @ApiOperation({ summary: 'Criar fazenda para produtor' })
  @ApiParam({
    name: 'producer_id',
    example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
  })
  @ApiBody({ type: CreateFarmDto })
  @ApiResponse({
    status: 201,
    description: 'Fazenda criada com sucesso',
    schema: {
      example: {
        message: 'Farm created successfully',
        data: {
          id: '1f7e16f8-48c7-456f-bcef-a6d1f445723e',
          name: 'Fazenda Primavera',
          city: 'Sorriso',
          state: 'MT',
          total_area: '1200.5',
          arable_area: '900.25',
          vegetation_area: '300.25',
          producer_id: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
          status: 'ACTIVE',
          created_at: '2026-08-14T12:00:00.000Z',
          updated_at: null,
          crops: [],
        },
      },
    },
  })
  @Post(':producer_id/farms')
  async createFarm(
    @Param('producer_id', new ParseUUIDPipe()) producerId: string,
    @Body() dto: CreateFarmDto,
  ): Promise<StandardApiResponse<FarmResponse>> {
    const farm = await this.producersService.addFarm(producerId, dto);
    return makeApiResponse('Farm created successfully', farm);
  }

  @ApiOperation({ summary: 'Adicionar cultura em fazenda/safra' })
  @ApiParam({
    name: 'producer_id',
    example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
  })
  @ApiParam({
    name: 'farm_id',
    example: '1f7e16f8-48c7-456f-bcef-a6d1f445723e',
  })
  @ApiBody({ type: CreateCropDto })
  @ApiResponse({
    status: 201,
    description: 'Cultura criada com sucesso',
    schema: {
      example: {
        message: 'Crop created successfully',
        data: {
          id: 'f089b2a8-44f0-476d-abef-df1ebd4a89f3',
          crop: 'SOYBEAN',
          harvest: 'Safra 2024',
          farm_id: '1f7e16f8-48c7-456f-bcef-a6d1f445723e',
          created_at: '2026-08-14T12:00:00.000Z',
        },
      },
    },
  })
  @Post(':producer_id/farms/:farm_id/crops')
  async addCrop(
    @Param('producer_id', new ParseUUIDPipe()) producerId: string,
    @Param('farm_id', new ParseUUIDPipe()) farmId: string,
    @Body() dto: CreateCropDto,
  ): Promise<StandardApiResponse<FarmCropResponse>> {
    const crop = await this.producersService.addCrop(producerId, farmId, dto);
    return makeApiResponse('Crop created successfully', crop);
  }

  @ApiOperation({ summary: 'Listar fazendas do produtor' })
  @ApiParam({
    name: 'producer_id',
    example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
  })
  @ApiResponse({
    status: 200,
    description: 'Fazendas listadas com sucesso',
    schema: {
      example: {
        message: 'Farms fetched successfully',
        data: [
          {
            id: '1f7e16f8-48c7-456f-bcef-a6d1f445723e',
            name: 'Fazenda Primavera',
            city: 'Sorriso',
            state: 'MT',
            total_area: '1200.5',
            arable_area: '900.25',
            vegetation_area: '300.25',
            producer_id: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
            status: 'ACTIVE',
            created_at: '2026-08-14T12:00:00.000Z',
            updated_at: '2026-08-14T12:00:00.000Z',
            crops: [],
          },
        ],
      },
    },
  })
  @Get(':producer_id/farms')
  async listFarms(
    @Param('producer_id', new ParseUUIDPipe()) producerId: string,
  ): Promise<StandardApiResponse<FarmResponse[]>> {
    const farms = await this.producersService.listFarms(producerId);
    return makeApiResponse('Farms fetched successfully', farms);
  }

  @ApiOperation({ summary: 'Remover fazenda' })
  @ApiParam({
    name: 'producer_id',
    example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
  })
  @ApiParam({
    name: 'farm_id',
    example: '1f7e16f8-48c7-456f-bcef-a6d1f445723e',
  })
  @ApiNoContentResponse({ description: 'Fazenda removida com sucesso' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':producer_id/farms/:farm_id')
  async removeFarm(
    @Param('producer_id', new ParseUUIDPipe()) producerId: string,
    @Param('farm_id', new ParseUUIDPipe()) farmId: string,
  ): Promise<void> {
    await this.producersService.removeFarm(producerId, farmId);
  }

  @ApiOperation({ summary: 'Listar culturas da fazenda' })
  @ApiParam({
    name: 'producer_id',
    example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
  })
  @ApiParam({
    name: 'farm_id',
    example: '1f7e16f8-48c7-456f-bcef-a6d1f445723e',
  })
  @ApiResponse({
    status: 200,
    description: 'Culturas listadas com sucesso',
    schema: {
      example: {
        message: 'Crops fetched successfully',
        data: [
          {
            id: 'f089b2a8-44f0-476d-abef-df1ebd4a89f3',
            crop: 'SOYBEAN',
            harvest: 'Safra 2024',
            farm_id: '1f7e16f8-48c7-456f-bcef-a6d1f445723e',
            created_at: '2026-08-14T12:00:00.000Z',
          },
        ],
      },
    },
  })
  @Get(':producer_id/farms/:farm_id/crops')
  async listCrops(
    @Param('producer_id', new ParseUUIDPipe()) producerId: string,
    @Param('farm_id', new ParseUUIDPipe()) farmId: string,
  ): Promise<StandardApiResponse<FarmCropResponse[]>> {
    const crops = await this.producersService.listCrops(producerId, farmId);
    return makeApiResponse('Crops fetched successfully', crops);
  }

  @ApiOperation({ summary: 'Remover cultura' })
  @ApiParam({
    name: 'producer_id',
    example: '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0',
  })
  @ApiParam({
    name: 'farm_id',
    example: '1f7e16f8-48c7-456f-bcef-a6d1f445723e',
  })
  @ApiParam({
    name: 'crop_id',
    example: 'f089b2a8-44f0-476d-abef-df1ebd4a89f3',
  })
  @ApiNoContentResponse({ description: 'Cultura removida com sucesso' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':producer_id/farms/:farm_id/crops/:crop_id')
  async removeCrop(
    @Param('producer_id', new ParseUUIDPipe()) producerId: string,
    @Param('farm_id', new ParseUUIDPipe()) farmId: string,
    @Param('crop_id', new ParseUUIDPipe()) cropId: string,
  ): Promise<void> {
    await this.producersService.removeCrop(producerId, farmId, cropId);
  }
}
