import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProducersListResponse } from './interfaces/producer-response.interface';
import { ProducersService } from './producers.service';

describe('producers_service', () => {
  type ProducerPayload = {
    document: string;
    name: string;
  };

  type ProducerRecord = {
    id: string;
    document: string;
    name: string;
    deletedAt: Date | null;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
    updatedAt: Date | null;
    farms: unknown[];
  };

  type FarmPayload = {
    name: string;
    city: string;
    state: string;
    total_area: string;
    arable_area: string;
    vegetation_area: string;
    crops: Array<{ crop: string; harvest: string }>;
  };

  type FarmRecord = {
    id: string;
    producerId: string;
    name: string;
    city: string;
    state: string;
    totalArea: Prisma.Decimal;
    arableArea: Prisma.Decimal;
    vegetationArea: Prisma.Decimal;
    deletedAt: Date | null;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: Date;
    updatedAt: Date | null;
    crops: unknown[];
  };

  type CropPayload = {
    crop: string;
    harvest: string;
  };

  type CropRecord = {
    id: string;
    farmId: string;
    crop: string;
    harvest: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
  };

  type PrismaMock = {
    producer: {
      findUnique: jest.Mock;
      create: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      findFirst: jest.Mock;
    };
    farm: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    farmCrop: {
      findFirst: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  let service: ProducersService;
  let prisma: PrismaMock;

  const producer_id = '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0';
  const other_producer_id = '28f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b1';
  const farm_id = '1f7e16f8-48c7-456f-bcef-a6d1f445723e';
  const other_farm_id = '2f7e16f8-48c7-456f-bcef-a6d1f445723f';
  const crop_id = 'f089b2a8-44f0-476d-abef-df1ebd4a89f3';

  const created_at = new Date('2026-08-14T12:00:00.000Z');
  const updated_at = new Date('2026-08-14T12:00:00.000Z');
  const deleted_at = new Date('2026-08-14T12:05:00.000Z');

  const create_prisma_service_mock = (): PrismaMock => ({
    producer: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    farmCrop: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  });

  const create_producer_payload = (
    overrides: Partial<ProducerPayload> = {},
  ): ProducerPayload => ({
    document: '12345678909',
    name: 'Joao da Silva',
    ...overrides,
  });

  const create_producer_record = (
    overrides: Partial<ProducerRecord> = {},
  ): ProducerRecord => ({
    id: producer_id,
    document: '12345678909',
    name: 'Joao da Silva',
    deletedAt: null,
    status: 'ACTIVE',
    createdAt: created_at,
    updatedAt: null,
    farms: [],
    ...overrides,
  });

  const create_farm_payload = (
    overrides: Partial<FarmPayload> = {},
  ): FarmPayload => ({
    name: 'Fazenda Primavera',
    city: 'Sorriso',
    state: 'MT',
    total_area: '1200.5',
    arable_area: '900.25',
    vegetation_area: '300.25',
    crops: [{ crop: 'SOYBEAN', harvest: 'Safra 2024' }],
    ...overrides,
  });

  const create_farm_record = (
    overrides: Partial<FarmRecord> = {},
  ): FarmRecord => ({
    id: farm_id,
    producerId: producer_id,
    name: 'Fazenda Primavera',
    city: 'Sorriso',
    state: 'MT',
    totalArea: new Prisma.Decimal('1200.5'),
    arableArea: new Prisma.Decimal('900.25'),
    vegetationArea: new Prisma.Decimal('300.25'),
    deletedAt: null,
    status: 'ACTIVE',
    createdAt: created_at,
    updatedAt: null,
    crops: [],
    ...overrides,
  });

  const create_crop_payload = (
    overrides: Partial<CropPayload> = {},
  ): CropPayload => ({
    crop: 'SOYBEAN',
    harvest: 'Safra 2024',
    ...overrides,
  });

  const create_crop_record = (
    overrides: Partial<CropRecord> = {},
  ): CropRecord => ({
    id: crop_id,
    farmId: farm_id,
    crop: 'SOYBEAN',
    harvest: 'Safra 2024',
    deletedAt: null,
    createdAt: created_at,
    updatedAt: null,
    ...overrides,
  });

  const normalize_to_snake_case = (input: unknown): unknown => {
    if (input instanceof Date) {
      return input.toISOString();
    }

    if (input instanceof Prisma.Decimal) {
      return input.toString();
    }

    if (Array.isArray(input)) {
      return input.map((item) => normalize_to_snake_case(item));
    }

    if (input && typeof input === 'object') {
      return Object.entries(input).reduce<Record<string, unknown>>(
        (accumulator, [key, value]) => {
          const snake_key = key.replace(
            /[A-Z]/g,
            (letter) => `_${letter.toLowerCase()}`,
          );
          accumulator[snake_key] = normalize_to_snake_case(value);
          return accumulator;
        },
        {},
      );
    }

    return input;
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const any_date = (): Date => expect.any(Date);

  const mock_producer_found = (
    overrides: Partial<ProducerRecord> = {},
  ): ProducerRecord => {
    const producer = create_producer_record(overrides);
    prisma.producer.findUnique.mockResolvedValue(producer);
    return producer;
  };

  const mock_farm_found = (overrides: Partial<FarmRecord> = {}): FarmRecord => {
    const farm = create_farm_record(overrides);
    prisma.farm.findUnique.mockResolvedValue(farm);
    return farm;
  };

  const mock_crop_found = (overrides: Partial<CropRecord> = {}): CropRecord => {
    const crop = create_crop_record(overrides);
    prisma.farmCrop.findUnique.mockResolvedValue(crop);
    return crop;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducersService,
        {
          provide: PrismaService,
          useValue: create_prisma_service_mock(),
        },
      ],
    }).compile();

    service = module.get<ProducersService>(ProducersService);
    prisma = module.get<PrismaMock>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('TC0001 - should_create_a_valid_producer', async () => {
    const payload: ProducerPayload = create_producer_payload();
    const mock_result: ProducerRecord = create_producer_record({
      farms: undefined,
    });

    prisma.producer.findFirst.mockResolvedValue(null);
    prisma.producer.create.mockResolvedValue(mock_result);

    const result = await service.create(payload);

    expect(prisma.producer.findFirst).toHaveBeenCalledWith({
      where: { document: '12345678909', deletedAt: null, status: 'ACTIVE' },
    });
    expect(prisma.producer.create).toHaveBeenCalledWith({
      data: {
        document: '12345678909',
        name: 'Joao da Silva',
        status: 'ACTIVE',
        updatedAt: null,
      },
    });
    expect(normalize_to_snake_case(result)).toEqual(
      expect.objectContaining({
        id: producer_id,
        document: '12345678909',
        name: 'Joao da Silva',
        status: 'ACTIVE',
        created_at: created_at.toISOString(),
        updated_at: null,
      }),
    );
  });

  it('TC0002 - should_reject_invalid_document', async () => {
    await expect(
      service.create(create_producer_payload({ document: 'invalid-document' })),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('TC0003 - should_reject_duplicate_document', async () => {
    prisma.producer.findFirst.mockResolvedValue({ id: other_producer_id });

    await expect(
      service.create(create_producer_payload()),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('TC0004 - should_accept_alphanumeric_cnpj', async () => {
    prisma.producer.findFirst.mockResolvedValue(null);
    prisma.producer.create.mockResolvedValue(
      create_producer_record({ document: 'PYNB3NTU000160' }),
    );

    await expect(
      service.create(
        create_producer_payload({ document: 'PY.NB3.NTU/0001-60' }),
      ),
    ).resolves.toMatchObject({
      document: 'PYNB3NTU000160',
      name: 'Joao da Silva',
    });
  });

  it('TC0005 - should_list_active_producers', async () => {
    const mock_result: ProducerRecord[] = [create_producer_record()];

    prisma.producer.count.mockResolvedValue(1);
    prisma.producer.findMany.mockResolvedValue(mock_result);

    const result: ProducersListResponse = await service.findAll(0, 10);

    expect(prisma.producer.count).toHaveBeenCalledWith({
      where: { deletedAt: null, status: 'ACTIVE' },
    });

    expect(prisma.producer.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, status: 'ACTIVE' },
      include: {
        farms: {
          where: { deletedAt: null, status: 'ACTIVE' },
          include: { crops: { where: { deletedAt: null } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 10,
    });
    expect(normalize_to_snake_case(result)).toEqual({
      records: [
        expect.objectContaining({
          id: producer_id,
          document: '12345678909',
          name: 'Joao da Silva',
          status: 'ACTIVE',
          created_at: created_at.toISOString(),
          updated_at: null,
        }),
      ],
      page: 0,
      page_size: 10,
      total_pages: 1,
      total_records: 1,
    });
  });

  it('TC0005A - should_apply_pagination_offset_for_producers', async () => {
    prisma.producer.count.mockResolvedValue(25);
    prisma.producer.findMany.mockResolvedValue([create_producer_record()]);

    const result: ProducersListResponse = await service.findAll(2, 10);

    expect(prisma.producer.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, status: 'ACTIVE' },
      include: {
        farms: {
          where: { deletedAt: null, status: 'ACTIVE' },
          include: { crops: { where: { deletedAt: null } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: 20,
      take: 10,
    });
    expect(normalize_to_snake_case(result)).toEqual({
      records: [
        expect.objectContaining({
          id: producer_id,
        }),
      ],
      page: 2,
      page_size: 10,
      total_pages: 3,
      total_records: 25,
    });
  });

  it('TC0006 - should_update_producer_name', async () => {
    const mock_result: ProducerRecord = create_producer_record({
      name: 'Joao da Silva Atualizado',
      updatedAt: new Date('2026-08-14T12:10:00.000Z'),
    });

    mock_producer_found();
    prisma.producer.update.mockResolvedValue(mock_result);

    const result = await service.update(producer_id, {
      name: 'Joao da Silva Atualizado',
    });

    expect(prisma.producer.update).toHaveBeenCalledWith({
      where: { id: producer_id },
      data: {
        name: 'Joao da Silva Atualizado',
        updatedAt: any_date(),
      },
    });
    expect(normalize_to_snake_case(result)).toEqual(
      expect.objectContaining({
        id: producer_id,
        document: '12345678909',
        name: 'Joao da Silva Atualizado',
        status: 'ACTIVE',
        created_at: created_at.toISOString(),
        updated_at: '2026-08-14T12:10:00.000Z',
      }),
    );
  });

  it('TC0007 - should_soft_delete_a_producer', async () => {
    const mock_result: ProducerRecord = create_producer_record({
      deletedAt: deleted_at,
      status: 'INACTIVE',
      farms: undefined,
    });

    mock_producer_found();
    prisma.producer.update.mockResolvedValue(mock_result);

    const result = await service.remove(producer_id);

    expect(prisma.producer.update).toHaveBeenCalledWith({
      where: { id: producer_id },
      data: {
        deletedAt: any_date(),
        status: 'INACTIVE',
        updatedAt: any_date(),
      },
    });
    expect(normalize_to_snake_case(result)).toEqual(
      expect.objectContaining({
        id: producer_id,
        document: '12345678909',
        name: 'Joao da Silva',
        status: 'INACTIVE',
        created_at: created_at.toISOString(),
      }),
    );
  });

  it('TC0008 - should_create_a_farm_with_valid_areas_and_crops', async () => {
    const payload: FarmPayload = create_farm_payload({
      state: 'mt',
      total_area: '1300.5',
    });
    const mock_result: FarmRecord = create_farm_record({
      crops: [{ id: crop_id, crop: 'SOYBEAN', harvest: 'Safra 2024' }],
    });

    mock_producer_found();
    prisma.farm.create.mockResolvedValue(mock_result);
    prisma.producer.update.mockResolvedValue(create_producer_record());

    const result = await service.addFarm(producer_id, payload as never);

    expect(prisma.farm.create).toHaveBeenCalledWith({
      data: {
        name: 'Fazenda Primavera',
        city: 'Sorriso',
        state: 'MT',
        totalArea: new Prisma.Decimal('1300.5'),
        arableArea: new Prisma.Decimal('900.25'),
        vegetationArea: new Prisma.Decimal('300.25'),
        producerId: producer_id,
        status: 'ACTIVE',
        crops: { create: [{ crop: 'SOYBEAN', harvest: 'Safra 2024' }] },
      },
      include: { crops: true },
    });
    expect(prisma.producer.update).toHaveBeenCalledWith({
      where: { id: producer_id },
      data: { updatedAt: any_date() },
    });
    expect(normalize_to_snake_case(result)).toEqual(
      expect.objectContaining({
        name: 'Fazenda Primavera',
        city: 'Sorriso',
        state: 'MT',
        total_area: '1200.5',
        arable_area: '900.25',
        vegetation_area: '300.25',
        producer_id: producer_id,
        status: 'ACTIVE',
        created_at: created_at.toISOString(),
        updated_at: null,
        crops: [
          {
            id: crop_id,
            crop: 'SOYBEAN',
            harvest: 'Safra 2024',
          },
        ],
      }),
    );
  });

  it('TC0009 - should_reject_invalid_farm_area_values', async () => {
    mock_producer_found();

    await expect(
      service.addFarm(
        producer_id,
        create_farm_payload({
          name: 'Fazenda',
          total_area: '100',
          arable_area: '60',
          vegetation_area: '50',
        }) as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('TC0010 - should_add_a_crop_to_a_farm', async () => {
    mock_producer_found();
    mock_farm_found();
    prisma.farmCrop.create.mockResolvedValue(create_crop_record());
    prisma.farm.update.mockResolvedValue(create_farm_record());

    const result = await service.addCrop(
      producer_id,
      farm_id,
      create_crop_payload(),
    );

    expect(prisma.farmCrop.create).toHaveBeenCalledWith({
      data: { farmId: farm_id, crop: 'SOYBEAN', harvest: 'Safra 2024' },
    });
    expect(prisma.farm.update).toHaveBeenCalledWith({
      where: { id: farm_id },
      data: { updatedAt: any_date() },
    });
    expect(prisma.producer.update).not.toHaveBeenCalled();
    expect(normalize_to_snake_case(result)).toEqual(
      expect.objectContaining({
        id: crop_id,
        crop: 'SOYBEAN',
        farm_id: farm_id,
        harvest: 'Safra 2024',
        created_at: created_at.toISOString(),
      }),
    );
  });

  it('TC0011 - should_reject_duplicate_crop_registration', async () => {
    const prisma_error = new Prisma.PrismaClientKnownRequestError(
      'duplicate key',
      { code: 'P2002', clientVersion: 'test-version' },
    );

    mock_producer_found();
    mock_farm_found();
    prisma.farmCrop.create.mockRejectedValue(prisma_error);

    await expect(
      service.addCrop(producer_id, farm_id, create_crop_payload()),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('TC0012 - should_list_farms_for_a_producer', async () => {
    const mock_result: FarmRecord[] = [create_farm_record()];

    mock_producer_found();
    prisma.farm.findMany.mockResolvedValue(mock_result);

    const result = await service.listFarms(producer_id);

    expect(prisma.farm.findMany).toHaveBeenCalledWith({
      where: { producerId: producer_id, deletedAt: null, status: 'ACTIVE' },
      include: { crops: { where: { deletedAt: null } } },
      orderBy: { createdAt: 'desc' },
    });
    expect(normalize_to_snake_case(result)).toEqual([
      {
        id: farm_id,
        producer_id: producer_id,
        name: 'Fazenda Primavera',
        city: 'Sorriso',
        state: 'MT',
        total_area: '1200.5',
        arable_area: '900.25',
        vegetation_area: '300.25',
        status: 'ACTIVE',
        created_at: created_at.toISOString(),
        updated_at: null,
        crops: [],
      },
    ]);
  });

  it('TC0013 - should_soft_delete_a_farm', async () => {
    mock_producer_found();
    mock_farm_found();
    prisma.farm.update.mockResolvedValue(
      create_farm_record({ deletedAt: deleted_at, status: 'INACTIVE' }),
    );

    const result = await service.removeFarm(producer_id, farm_id);

    expect(prisma.farm.update).toHaveBeenCalledWith({
      where: { id: farm_id },
      data: {
        deletedAt: any_date(),
        status: 'INACTIVE',
        updatedAt: any_date(),
      },
    });
    expect(normalize_to_snake_case(result)).toEqual(
      expect.objectContaining({
        status: 'INACTIVE',
      }),
    );
  });

  it('TC0014 - should_list_crops_for_a_farm', async () => {
    const mock_result: CropRecord[] = [create_crop_record()];

    mock_producer_found();
    mock_farm_found();
    prisma.farmCrop.findMany.mockResolvedValue(mock_result);

    const result = await service.listCrops(producer_id, farm_id);

    expect(prisma.farmCrop.findMany).toHaveBeenCalledWith({
      where: { farmId: farm_id, deletedAt: null },
      orderBy: { harvest: 'desc' },
    });
    expect(normalize_to_snake_case(result)).toEqual([
      {
        id: crop_id,
        farm_id: farm_id,
        crop: 'SOYBEAN',
        harvest: 'Safra 2024',
        created_at: created_at.toISOString(),
      },
    ]);
  });

  it('TC0015 - should_soft_delete_a_crop', async () => {
    mock_producer_found();
    mock_farm_found();
    mock_crop_found();
    prisma.farmCrop.update.mockResolvedValue(
      create_crop_record({ deletedAt: deleted_at, updatedAt: updated_at }),
    );

    const result = await service.removeCrop(producer_id, farm_id, crop_id);

    expect(prisma.farmCrop.update).toHaveBeenCalledWith({
      where: { id: crop_id },
      data: {
        deletedAt: any_date(),
        updatedAt: any_date(),
      },
    });
    expect(prisma.farm.update).not.toHaveBeenCalled();
    expect(normalize_to_snake_case(result)).toEqual(
      expect.objectContaining({
        id: crop_id,
        farm_id: farm_id,
        crop: 'SOYBEAN',
        harvest: 'Safra 2024',
        created_at: created_at.toISOString(),
      }),
    );
  });

  it('TC0016 - should_reject_invalid_crop_when_creating_a_farm', async () => {
    mock_producer_found();

    await expect(
      service.addFarm(
        producer_id,
        create_farm_payload({
          crops: [{ crop: 'INVALID_CROP', harvest: 'Safra 2024' }],
        }) as never,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('TC0017 - should_create_a_farm_without_crops', async () => {
    const mock_result: FarmRecord = create_farm_record({
      crops: [],
    });

    mock_producer_found();
    prisma.farm.create.mockResolvedValue(mock_result);

    const result = await service.addFarm(
      producer_id,
      create_farm_payload({ crops: [] }) as never,
    );

    expect(prisma.farm.create).toHaveBeenCalledWith({
      data: {
        name: 'Fazenda Primavera',
        city: 'Sorriso',
        state: 'MT',
        totalArea: new Prisma.Decimal('1200.5'),
        arableArea: new Prisma.Decimal('900.25'),
        vegetationArea: new Prisma.Decimal('300.25'),
        producerId: producer_id,
        status: 'ACTIVE',
        crops: undefined,
      },
      include: { crops: true },
    });
    expect(normalize_to_snake_case(result)).toEqual(
      expect.objectContaining({
        producer_id: producer_id,
        status: 'ACTIVE',
      }),
    );
  });

  it('TC0018 - should_reject_invalid_crop_when_adding_a_crop', async () => {
    mock_producer_found();
    mock_farm_found();

    await expect(
      service.addCrop(producer_id, farm_id, {
        crop: 'INVALID_CROP',
        harvest: 'Safra 2024',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('TC0019 - should_reject_add_crop_when_farm_does_not_belong_to_producer', async () => {
    mock_producer_found();
    mock_farm_found({ producerId: other_producer_id });

    await expect(
      service.addCrop(producer_id, farm_id, create_crop_payload()),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0020 - should_reject_remove_farm_when_farm_does_not_belong_to_producer', async () => {
    mock_producer_found();
    mock_farm_found({ producerId: other_producer_id });

    await expect(
      service.removeFarm(producer_id, farm_id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0021 - should_reject_list_crops_when_farm_does_not_belong_to_producer', async () => {
    mock_producer_found();
    mock_farm_found({ producerId: other_producer_id });

    await expect(
      service.listCrops(producer_id, farm_id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0022 - should_reject_remove_crop_when_farm_does_not_belong_to_producer', async () => {
    mock_producer_found();
    mock_farm_found({ producerId: other_producer_id });
    mock_crop_found();

    await expect(
      service.removeCrop(producer_id, farm_id, crop_id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0023 - should_reject_remove_crop_when_crop_is_missing', async () => {
    mock_producer_found();
    mock_farm_found();
    prisma.farmCrop.findUnique.mockResolvedValue(null);

    await expect(
      service.removeCrop(producer_id, farm_id, crop_id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0024 - should_reject_find_one_when_producer_is_not_found', async () => {
    prisma.producer.findUnique.mockResolvedValue(null);

    await expect(service.findOne(producer_id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('TC0025 - should_reject_find_one_when_producer_is_deleted', async () => {
    mock_producer_found({ deletedAt: deleted_at });

    await expect(service.findOne(producer_id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('TC0026 - should_reject_remove_crop_when_crop_is_deleted', async () => {
    mock_producer_found();
    mock_farm_found();
    mock_crop_found({ deletedAt: deleted_at });

    await expect(
      service.removeCrop(producer_id, farm_id, crop_id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0027 - should_reject_add_farm_when_producer_is_not_found', async () => {
    prisma.producer.findUnique.mockResolvedValue(null);

    await expect(
      service.addFarm(producer_id, create_farm_payload() as never),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0028 - should_reject_get_farm_when_farm_is_not_found', async () => {
    mock_producer_found();
    prisma.farm.findUnique.mockResolvedValue(null);

    await expect(
      service.listCrops(producer_id, farm_id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0029 - should_reject_get_farm_when_farm_is_deleted', async () => {
    mock_producer_found();
    mock_farm_found({ deletedAt: deleted_at });

    await expect(
      service.listCrops(producer_id, farm_id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('TC0016 - should_reject_remove_crop_when_crop_is_not_found', async () => {
    mock_producer_found();
    mock_farm_found();
    mock_crop_found({
      id: '9f089b2a8-44f0-476d-abef-df1ebd4a89f9',
      farmId: other_farm_id,
      deletedAt: created_at,
    });

    await expect(
      service.removeCrop(producer_id, farm_id, crop_id),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
