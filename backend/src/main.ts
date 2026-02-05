import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType, BadRequestException } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.setGlobalPrefix('api');

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const formattedErrors = errors.reduce((acc, err) => {
        acc[err.property] = Object.values(err.constraints || {})[0];
        return acc;
      }, {});

      return new BadRequestException({
        message: 'Dados inválidos',
        errors: formattedErrors,
      });
    },
  }));

  const httpAdapter = app.get(HttpAdapterHost);
  const logger = app.get(Logger);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, logger));

  const config = new DocumentBuilder()
    .setTitle('Excellent API')
    .setDescription('API documentation for Excellent project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
