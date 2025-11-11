// apps/driver-api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- THÊM DÒNG NÀY VÀO ---
  app.enableCors({
    origin: 'http://localhost:5173', // Cho phép FE của bạn gọi
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // -------------------------

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();