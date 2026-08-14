import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';
import request from 'supertest';
import { App } from 'supertest/types';
import { hashSync } from 'bcryptjs';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const authUsername = faker.internet.username();

  beforeAll(async () => {
    process.env.DATABASE_URL ??=
      'postgresql://postgres:postgres@localhost:5432/brain_agriculture?schema=public';
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.AUTH_USERNAME = authUsername;
    process.env.AUTH_PASSWORD_HASH = hashSync('test-password', 10);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /auth/login should be public and return JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: authUsername,
        password: 'test-password',
      })
      .expect(200);

    const responseBody = response.body as {
      access_token: string;
      token_type: string;
      expires_in: string;
    };

    expect(responseBody).toMatchObject({
      token_type: 'Bearer',
      expires_in: '1h',
    });
    expect(typeof responseBody.access_token).toBe('string');
  });

  it('GET /health should return 401 without token', () => {
    return request(app.getHttpServer()).get('/health').expect(401);
  });

  it('GET /health should return 401 with invalid token', () => {
    return request(app.getHttpServer())
      .get('/health')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('GET /health should return 200 with valid token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: authUsername,
        password: 'test-password',
      })
      .expect(200);

    const loginBody = loginResponse.body as { access_token: string };

    return request(app.getHttpServer())
      .get('/health')
      .set('Authorization', `Bearer ${loginBody.access_token}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
