import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: true, // Allow all origins; you can also specify an array of allowed origins if needed
    allowedHeaders: 'Content-Type,Authorization', // Allowed headers
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Donation App Documentation')
    .setDescription('Documentation Version 1')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { tagsSorter: 'alpha' },
  });
  // await connectDatabase();
  await app.listen(process.env.PORT || 3000 || 8080, '0.0.0.0');

  // await app.listen(process.env.PORT);
}
bootstrap();
