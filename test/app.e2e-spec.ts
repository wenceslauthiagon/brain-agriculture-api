import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { hashSync } from 'bcryptjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('app_controller_e2e', () => {
  let app: INestApplication<App>;

  const auth_username = 'test-brain';
  const auth_password = '123456';

  const login_as_user = async () =>
    request(app.getHttpServer()).post('/auth/login').send({
      username: auth_username,
      password: auth_password,
    });

  beforeAll(async () => {
    process.env.DATABASE_URL ??=
      'postgresql://postgres:postgres@localhost:5432/brain_agriculture?schema=public';
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_EXPIRES_IN = '1h';
    process.env.AUTH_USERNAME = auth_username;
    process.env.AUTH_PASSWORD_HASH = hashSync(auth_password, 10);

    const module_fixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module_fixture.createNestApplication();
    await app.init();
  });

  it('TC0001 - should_post_auth_login_and_return_jwt', async () => {
    const response = await login_as_user();
    const response_body = response.body as {
      access_token: string;
      token_type: string;
      expires_in: string;
    };

    expect(response.status).toBe(HttpStatus.OK);
    expect(response_body).toMatchObject({
      token_type: 'Bearer',
      expires_in: '1h',
    });
    expect(typeof response_body.access_token).toBe('string');
  });

  it('TC0002 - should_get_health_without_token', async () => {
    await request(app.getHttpServer()).get('/health').expect(HttpStatus.OK);
  });

  it('TC0003 - should_get_health_with_invalid_token', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .set('Authorization', 'Bearer invalid-token')
      .expect(HttpStatus.OK);
  });

  it('TC0004 - should_get_health_with_valid_token', async () => {
    const login_response = await login_as_user();
    const login_body = login_response.body as { access_token: string };

    expect(login_response.status).toBe(HttpStatus.OK);

    await request(app.getHttpServer())
      .get('/health')
      .set('Authorization', `Bearer ${login_body.access_token}`)
      .expect(HttpStatus.OK);
  });

  afterAll(async () => {
    await app.close();
  });
});
