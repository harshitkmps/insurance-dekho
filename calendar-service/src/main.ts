import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from './pipes/validation.pipe';
import { Logger } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
  const newrelic = require('newrelic/index');
  const logger = new Logger('Bootstrap');
  const PORT = 3000;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('id-calendar-service')
    .setDescription('Calendar Service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api', app, document);
  logger.log(`===== app listening on port ${PORT} ====`);
  await app.listen(PORT);
}
bootstrap();
