// apps/driver-api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  // __dirname = apps/driver-api/dist  -> ../public = apps/driver-api/public
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/static/' });

  const webOrigin = process.env.APP_WEB_ORIGIN || 'http://localhost:5173';
  app.enableCors({
    origin: [webOrigin, 'http://localhost:5173', 'https://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);

  console.log(`API: http://localhost:${port}`);
  console.log(`Static: http://localhost:${port}/static/`);
}
bootstrap();
