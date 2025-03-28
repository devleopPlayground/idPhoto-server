import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors();

  const PORT = configService.get<number>('PORT') ?? 9000;

  await app.listen(PORT);
}

bootstrap();
