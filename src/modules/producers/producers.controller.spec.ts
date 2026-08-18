import { Test, TestingModule } from '@nestjs/testing';
import { ProducersController } from './producers.controller';
import { ProducersService } from './producers.service';

describe('producers_controller', () => {
  let controller: ProducersController;
  let producers_service: jest.Mocked<
    Pick<
      ProducersService,
      | 'create'
      | 'findAll'
      | 'findOne'
      | 'update'
      | 'remove'
      | 'addFarm'
      | 'addCrop'
      | 'listFarms'
      | 'removeFarm'
      | 'listCrops'
      | 'removeCrop'
    >
  >;

  const producer_id = '18f8d4f2-a2c3-450c-b7b8-3f1f4f56f2b0';
  const farm_id = '1f7e16f8-48c7-456f-bcef-a6d1f445723e';
  const crop_id = 'f089b2a8-44f0-476d-abef-df1ebd4a89f3';

  const create_producers_service_mock = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    addFarm: jest.fn(),
    addCrop: jest.fn(),
    listFarms: jest.fn(),
    removeFarm: jest.fn(),
    listCrops: jest.fn(),
    removeCrop: jest.fn(),
  });

  const create_producer_payload = (overrides = {}) => ({
    document: '12345678909',
    name: 'Joao da Silva',
    ...overrides,
  });

  const create_producer_response = (overrides = {}) => ({
    id: producer_id,
    document: '12345678909',
    name: 'Joao da Silva',
    status: 'ACTIVE',
    created_at: '2026-08-14T12:00:00.000Z',
    updated_at: null,
    ...overrides,
  });

  const create_farm_payload = (overrides = {}) => ({
    name: 'Fazenda Primavera',
    city: 'Sorriso',
    state: 'MT',
    total_area: '1200.5',
    arable_area: '900.25',
    vegetation_area: '300.25',
    ...overrides,
  });

  const create_farm_response = (overrides = {}) => ({
    id: farm_id,
    name: 'Fazenda Primavera',
    city: 'Sorriso',
    state: 'MT',
    total_area: '1200.5',
    arable_area: '900.25',
    vegetation_area: '300.25',
    producer_id: producer_id,
    status: 'ACTIVE',
    created_at: '2026-08-14T12:00:00.000Z',
    updated_at: null,
    crops: [],
    ...overrides,
  });

  const create_crop_payload = (overrides = {}) => ({
    crop: 'SOYBEAN',
    harvest: 'Safra 2024',
    ...overrides,
  });

  const create_crop_response = (overrides = {}) => ({
    id: crop_id,
    crop: 'SOYBEAN',
    harvest: 'Safra 2024',
    farm_id: farm_id,
    created_at: '2026-08-14T12:00:00.000Z',
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducersController],
      providers: [
        {
          provide: ProducersService,
          useValue: create_producers_service_mock(),
        },
      ],
    }).compile();

    controller = module.get<ProducersController>(ProducersController);
    producers_service = module.get(ProducersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('TC0001 - should_create_a_producer_and_return_the_formatted_response', async () => {
    const payload = create_producer_payload();
    const mock_response = create_producer_response();

    producers_service.create.mockResolvedValue(mock_response as never);

    const result = await controller.create(payload);

    expect(producers_service.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual({
      message: 'Producer created successfully',
      data: mock_response,
    });
  });

  it('TC0002 - should_list_producers', async () => {
    const mock_response = {
      records: [create_producer_response()],
      page: 0,
      pageSize: 10,
      total_pages: 1,
      total_records: 1,
    };

    producers_service.findAll.mockResolvedValue(mock_response as never);

    const result = await controller.findAll(0, 10);

    expect(producers_service.findAll).toHaveBeenCalledWith(0, 10);
    expect(result).toEqual({
      message: 'Producers fetched successfully',
      data: mock_response,
    });
  });

  it('TC0002A - should_reject_negative_page', async () => {
    await expect(controller.findAll(-1, 10)).rejects.toThrow(
      'page must be greater than or equal to 0',
    );
  });

  it('TC0002B - should_reject_invalid_page_size', async () => {
    await expect(controller.findAll(0, 0)).rejects.toThrow(
      'pageSize must be greater than or equal to 1',
    );
  });

  it('TC0003 - should_fetch_one_producer_by_id', async () => {
    const mock_response = create_producer_response({ farms: [] });

    producers_service.findOne.mockResolvedValue(mock_response as never);

    const result = await controller.findOne(producer_id);

    expect(producers_service.findOne).toHaveBeenCalledWith(producer_id);
    expect(result).toEqual({
      message: 'Producer fetched successfully',
      data: mock_response,
    });
  });

  it('TC0004 - should_update_a_producer_and_return_the_formatted_response', async () => {
    const dto = { name: 'Joao da Silva Atualizado' };
    const mock_response = create_producer_response({
      name: 'Joao da Silva Atualizado',
      updated_at: '2026-08-14T12:10:00.000Z',
    });

    producers_service.update.mockResolvedValue(mock_response as never);

    const result = await controller.update(producer_id, dto);

    expect(producers_service.update).toHaveBeenCalledWith(producer_id, dto);
    expect(result).toEqual({
      message: 'Producer updated successfully',
      data: mock_response,
    });
  });

  it('TC0005 - should_remove_a_producer_by_id', async () => {
    producers_service.remove.mockResolvedValue(undefined as never);

    await expect(controller.remove(producer_id)).resolves.toBeUndefined();
    expect(producers_service.remove).toHaveBeenCalledWith(producer_id);
  });

  it('TC0006 - should_create_a_farm_and_return_the_formatted_response', async () => {
    const dto = create_farm_payload();
    const mock_response = create_farm_response();

    producers_service.addFarm.mockResolvedValue(mock_response as never);

    const result = await controller.createFarm(producer_id, dto as never);

    expect(producers_service.addFarm).toHaveBeenCalledWith(producer_id, dto);
    expect(result).toEqual({
      message: 'Farm created successfully',
      data: mock_response,
    });
  });

  it('TC0007 - should_add_a_crop_and_return_the_formatted_response', async () => {
    const dto = create_crop_payload();
    const mock_response = create_crop_response();

    producers_service.addCrop.mockResolvedValue(mock_response as never);

    const result = await controller.addCrop(producer_id, farm_id, dto);

    expect(producers_service.addCrop).toHaveBeenCalledWith(
      producer_id,
      farm_id,
      dto,
    );
    expect(result).toEqual({
      message: 'Crop created successfully',
      data: mock_response,
    });
  });

  it('TC0008 - should_list_farms_for_a_producer', async () => {
    const mock_response = [create_farm_response()];

    producers_service.listFarms.mockResolvedValue(mock_response as never);

    const result = await controller.listFarms(producer_id);

    expect(producers_service.listFarms).toHaveBeenCalledWith(producer_id);
    expect(result).toEqual({
      message: 'Farms fetched successfully',
      data: mock_response,
    });
  });

  it('TC0009 - should_remove_a_farm_by_id', async () => {
    producers_service.removeFarm.mockResolvedValue(undefined as never);

    await expect(
      controller.removeFarm(producer_id, farm_id),
    ).resolves.toBeUndefined();
    expect(producers_service.removeFarm).toHaveBeenCalledWith(
      producer_id,
      farm_id,
    );
  });

  it('TC0010 - should_list_crops_for_a_farm', async () => {
    const mock_response = [create_crop_response()];

    producers_service.listCrops.mockResolvedValue(mock_response as never);

    const result = await controller.listCrops(producer_id, farm_id);

    expect(producers_service.listCrops).toHaveBeenCalledWith(
      producer_id,
      farm_id,
    );
    expect(result).toEqual({
      message: 'Crops fetched successfully',
      data: mock_response,
    });
  });

  it('TC0011 - should_remove_a_crop_by_id', async () => {
    producers_service.removeCrop.mockResolvedValue(undefined as never);

    await expect(
      controller.removeCrop(producer_id, farm_id, crop_id),
    ).resolves.toBeUndefined();
    expect(producers_service.removeCrop).toHaveBeenCalledWith(
      producer_id,
      farm_id,
      crop_id,
    );
  });
});
