/* eslint-disable @typescript-eslint/no-floating-promises */
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ErrorHandlerFilter } from './common/error-handler/error-handler.filter';
import { ErrorHandlerService } from './common/error-handler/error-handler.service';
import { SnakeCaseInterceptor } from './common/interceptors/snake-case.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const errorHandlerService = app.get(ErrorHandlerService);
  const corsOrigin = process.env.CORS_ORIGIN?.trim();
  const isDevelopment =
    (process.env.NODE_ENV ?? 'development') !== 'production';
  let corsOrigins: Array<RegExp | string | boolean> | boolean;

  if (corsOrigin) {
    corsOrigins = corsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  } else if (isDevelopment) {
    corsOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];
  } else {
    corsOrigins = false;
  }

  app.use(helmet());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalFilters(new ErrorHandlerFilter(errorHandlerService));
  app.useGlobalInterceptors(new SnakeCaseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Brain Agriculture API')
    .setDescription(
      'API para gerenciamento de produtores rurais, fazendas e culturas por safra.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: (a: string, b: string) => {
        const customOrder = ['Auth', 'Dashboard', 'Producers', 'Health'];
        const indexA = customOrder.indexOf(a);
        const indexB = customOrder.indexOf(b);

        if (indexA === -1 && indexB === -1) {
          return a.localeCompare(b);
        }
        if (indexA === -1) {
          return 1;
        }
        if (indexB === -1) {
          return -1;
        }

        return indexA - indexB;
      },
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
