/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ErrorHandlerFilter } from './common/error-handler/error-handler.filter';
import { ErrorHandlerService } from './common/error-handler/error-handler.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const errorHandlerService = app.get(ErrorHandlerService);

  app.useGlobalFilters(new ErrorHandlerFilter(errorHandlerService));

  const config = new DocumentBuilder()
    .setTitle('Brain Agriculture API')
    .setDescription(
      'API para gerenciamento de produtores rurais, fazendas e culturas por safra.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
