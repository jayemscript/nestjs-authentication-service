import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const expressApp = app.getHttpAdapter().getInstance() as express.Express;
  expressApp.set('trust proxy', 1);
  expressApp.disable('x-powered-by');
  expressApp.enable('strict routing');

  //Apply global exception filter

  const configService = app.get(ConfigService);
  /*
   * CORS SETUP
   */
  const allowedOrigins =
    configService.get<string>('CORS_ORIGINS')?.split(',') || [];
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Pragma',
    ],
    credentials: true,
  });

  // ----- Middlewares -----
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const swaggerEnabled =
    configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NestJS Authentication Service')
      .setDescription('Authentication and session management API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'bearer',
      )
      .addApiKey(
        { type: 'apiKey', name: 'x-app-id', in: 'header' },
        'app-id',
      )
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);
    console.log('Swagger UI available at /docs');
  }

  const port = Number(configService.getOrThrow('PORT'));
  await app.listen(port);
  const nodeEnv = configService.getOrThrow<string>('NODE_ENV');

  if (nodeEnv === 'development') {
    console.log(`SERVER IS RUNNING ON PORT: ${port}`);
    console.log(`MODE:${nodeEnv}`);
  } else if (nodeEnv === 'production') {
    console.log(`SERVER IS RUNNING ON PORT: ${port}`);
    console.log(`MODE:${nodeEnv}`);
  } else if (nodeEnv === 'maintenance') {
    console.log(`SERVER IS RUNNING ON PORT: ${port}`);
    console.log(`MODE:${nodeEnv}`);
    console.log(
      'The system is currently under maintenance. Please try again later.',
    );
  } else {
    console.log(`AUTH SERVICES IS RUNNING ON PORT: ${port}`);
  }
  console.log(`go to http://localhost:${port} for checking the endpoint`);
  console.log(`go to http://localhost:${port}/docs for web api client`);

}
bootstrap();
