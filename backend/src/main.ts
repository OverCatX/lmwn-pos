import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // CORS for frontend
  const frontendUrl = configService.get<string>('app.frontendUrl', 'http://localhost:5173');
  app.enableCors({
    origin: frontendUrl.split(',').map(url => url.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Implicit type conversion
      },
    }),
  );

  // Set global prefix BEFORE Swagger setup
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // API Versioning (/api/v1/orders)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = new DocumentBuilder()
    .setTitle('POS System API')
    .setDescription(
      'LMWN 2026 POS System - Backend API Documentation\n\n' +
      'Base URL: `/api/v1`',
    )
    .setVersion('1.0')
    .addTag('Orders', 'Order management endpoints')
    .addTag('Products', 'Product management endpoints')
    .addTag('Reports', 'Sales reports and analytics endpoints')
    // .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'POS API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}

void bootstrap();
