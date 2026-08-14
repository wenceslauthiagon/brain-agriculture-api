import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { ProducersService } from './producers.service';

describe('ProducersService', () => {
  let service: ProducersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProducersService,
        {
          provide: PrismaService,
          useValue: {
            producer: {
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
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
            },
          },
        },
      ],
    }).compile();

    service = module.get<ProducersService>(ProducersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
