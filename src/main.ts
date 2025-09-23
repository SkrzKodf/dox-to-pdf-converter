import { NestFactory } from '@nestjs/core';
import '~src/telemetry/config/otel-config';
import { AppModule } from './app.module';
import { ConsoleLogger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { customValidationPipe } from '~src/http/pipes/custom-validation.pipe';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: process.env.IS_STEND === 'true'
    })
  });

  app.use(
    express.raw({
      type: 'application/octet-stream',
      limit: '50mb'
    })
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  app.useGlobalPipes(customValidationPipe);

  const configService = app.get(ConfigService);

  const swaggerConf = configService.get('swagger');
  const config = new DocumentBuilder()
    .setTitle(swaggerConf.title)
    .setDescription(swaggerConf.description)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerConf.path, app, document, {
    jsonDocumentUrl: swaggerConf.jsonPath
  });

  await app.listen(configService.get('http.port') || 3000);
}

bootstrap();
