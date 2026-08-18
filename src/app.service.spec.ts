import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('app_service', () => {
  let service: AppService;
  let prisma_service: {
    $queryRaw: jest.Mock;
  };

  const create_prisma_service_mock = () => ({
    $queryRaw: jest.fn(),
  });

  beforeEach(() => {
    prisma_service = create_prisma_service_mock();
    service = new AppService(prisma_service as unknown as PrismaService);
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('TC0001 - should return healthy_response when database is up', async () => {
    prisma_service.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.getHealth();

    expect(prisma_service.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      status: 'ok',
      service: 'brain-agriculture-api',
      environment: 'test',
      checks: { database: 'up' },
    });
    expect(typeof result.timestamp).toBe('string');
    expect(typeof result.uptime).toBe('number');
  });

  it('TC0002 - should return degraded_response when database is down', async () => {
    prisma_service.$queryRaw.mockRejectedValue(
      new Error('database unavailable'),
    );

    const result = await service.getHealth();

    expect(prisma_service.$queryRaw).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      status: 'ok',
      service: 'brain-agriculture-api',
      environment: 'test',
      checks: { database: 'down' },
    });
  });

  it('TC0003 - should use default_environment when NODE_ENV is not defined', async () => {
    delete process.env.NODE_ENV;
    prisma_service.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.getHealth();

    expect(result.environment).toBe('development');
    expect(result.checks.database).toBe('up');
  });

  it('TC0004 - should keep uptime as a number when process_uptime is available', async () => {
    prisma_service.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.getHealth();

    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });
});
