import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Crop, Prisma } from '@prisma/client';
import { ERROR_MESSAGES } from '../../common/constants/messages/error-messages.constants';
import { normalizeCrop } from '../../common/validation/crop.validation';
import { isValidFarmArea } from '../../common/validation/farm-area.validation';
import {
  isValidCpfOrCnpj,
  sanitizeDocument,
} from '../../common/validation/document.validation';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCropDto } from './dto/create-crop.dto';
import { CreateFarmDto } from './dto/create-farm.dto';
import { CreateProducerDto } from './dto/create-producer.dto';
import {
  FarmCropResponse,
  FarmResponse,
  ProducerResponse,
} from './interfaces/producer-response.interface';
import { UpdateProducerDto } from './dto/update-producer.dto';

@Injectable()
export class ProducersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProducerDto): Promise<ProducerResponse> {
    const document = sanitizeDocument(dto.document);
    this.ensureValidDocument(document);
    await this.ensureDocumentIsAvailable(document);

    return this.prisma.producer.create({
      data: {
        document,
        name: dto.name,
        status: 'ACTIVE',
      },
    });
  }

  async findAll(): Promise<ProducerResponse[]> {
    return this.prisma.producer.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
      },
      include: {
        farms: {
          where: {
            deletedAt: null,
            status: 'ACTIVE',
          },
          include: {
            crops: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<ProducerResponse> {
    return this.getProducerOrFail(id);
  }

  async update(id: string, dto: UpdateProducerDto): Promise<ProducerResponse> {
    await this.getProducerOrFail(id);

    const data: Prisma.ProducerUpdateInput = {};

    if (dto.name) {
      data.name = dto.name;
    }

    return this.prisma.producer.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<ProducerResponse> {
    await this.getProducerOrFail(id);

    return this.prisma.producer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    });
  }

  async addFarm(producerId: string, dto: CreateFarmDto): Promise<FarmResponse> {
    await this.getProducerOrFail(producerId);

    if (
      !isValidFarmArea(dto.total_area, dto.arable_area, dto.vegetation_area)
    ) {
      throw new BadRequestException(ERROR_MESSAGES.FARM_AREA_INVALID);
    }

    const crops = dto.crops?.map((crop) => ({
      crop: this.normalizeCropOrFail(crop.crop),
      harvest: crop.harvest,
    }));

    return this.prisma.farm.create({
      data: {
        name: dto.name,
        city: dto.city,
        state: dto.state.toUpperCase(),
        totalArea: new Prisma.Decimal(dto.total_area),
        arableArea: new Prisma.Decimal(dto.arable_area),
        vegetationArea: new Prisma.Decimal(dto.vegetation_area),
        producerId,
        status: 'ACTIVE',
        crops: crops?.length
          ? {
              create: crops,
            }
          : undefined,
      },
      include: {
        crops: true,
      },
    });
  }

  async addCrop(
    producerId: string,
    farmId: string,
    dto: CreateCropDto,
  ): Promise<FarmCropResponse> {
    await this.getProducerOrFail(producerId);

    const farm = await this.getFarmOrFail(farmId);
    if (farm.producerId !== producerId) {
      throw new NotFoundException(ERROR_MESSAGES.FARM_NOT_FOUND);
    }

    try {
      return await this.prisma.farmCrop.create({
        data: {
          farmId,
          crop: this.normalizeCropOrFail(dto.crop),
          harvest: dto.harvest,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(ERROR_MESSAGES.CROP_ALREADY_REGISTERED);
      }

      throw error;
    }
  }

  async listFarms(producerId: string): Promise<FarmResponse[]> {
    await this.getProducerOrFail(producerId);

    return this.prisma.farm.findMany({
      where: {
        producerId,
        deletedAt: null,
        status: 'ACTIVE',
      },
      include: {
        crops: {
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async removeFarm(producerId: string, farmId: string): Promise<FarmResponse> {
    await this.getProducerOrFail(producerId);

    const farm = await this.getFarmOrFail(farmId);
    if (farm.producerId !== producerId) {
      throw new NotFoundException(ERROR_MESSAGES.FARM_NOT_FOUND);
    }

    return this.prisma.farm.update({
      where: { id: farmId },
      data: {
        deletedAt: new Date(),
        status: 'INACTIVE',
      },
    });
  }

  async listCrops(
    producerId: string,
    farmId: string,
  ): Promise<FarmCropResponse[]> {
    await this.getProducerOrFail(producerId);

    const farm = await this.getFarmOrFail(farmId);
    if (farm.producerId !== producerId) {
      throw new NotFoundException(ERROR_MESSAGES.FARM_NOT_FOUND);
    }

    return this.prisma.farmCrop.findMany({
      where: {
        farmId,
        deletedAt: null,
      },
      orderBy: {
        harvest: 'desc',
      },
    });
  }

  async removeCrop(
    producerId: string,
    farmId: string,
    cropId: string,
  ): Promise<FarmCropResponse> {
    await this.getProducerOrFail(producerId);

    const farm = await this.getFarmOrFail(farmId);
    if (farm.producerId !== producerId) {
      throw new NotFoundException(ERROR_MESSAGES.FARM_NOT_FOUND);
    }

    const crop = await this.prisma.farmCrop.findUnique({
      where: { id: cropId },
    });

    if (!crop?.farmId || crop.farmId !== farmId || crop.deletedAt) {
      throw new NotFoundException(ERROR_MESSAGES.INVALID_CROP);
    }

    return this.prisma.farmCrop.update({
      where: { id: cropId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private async ensureDocumentIsAvailable(
    document: string,
    producerId?: string,
  ) {
    const existingProducer = await this.prisma.producer.findFirst({
      where: producerId
        ? {
            document,
            deletedAt: null,
            status: 'ACTIVE',
            id: {
              not: producerId,
            },
          }
        : {
            document,
            deletedAt: null,
            status: 'ACTIVE',
          },
    });

    if (existingProducer) {
      throw new ConflictException(
        ERROR_MESSAGES.PRODUCER_DOCUMENT_ALREADY_EXISTS,
      );
    }
  }

  private ensureValidDocument(document: string) {
    if (!isValidCpfOrCnpj(document)) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_DOCUMENT);
    }
  }

  private async getProducerOrFail(id: string): Promise<ProducerResponse> {
    const producer = await this.prisma.producer.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        farms: {
          where: {
            deletedAt: null,
            status: 'ACTIVE',
          },
          include: {
            crops: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!producer || producer.deletedAt) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCER_NOT_FOUND);
    }

    return producer;
  }

  private async getFarmOrFail(id: string): Promise<FarmResponse> {
    const farm = await this.prisma.farm.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        crops: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!farm || farm.deletedAt) {
      throw new NotFoundException(ERROR_MESSAGES.FARM_NOT_FOUND);
    }

    return farm;
  }

  private normalizeCropOrFail(crop: string): Crop {
    const normalizedCrop = normalizeCrop(crop);

    if (!normalizedCrop) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_CROP);
    }

    return normalizedCrop;
  }
}
