import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { join } from 'path';

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

  const port = Number(configService.get('PORT')) || 4000;
  await app.listen(port);
  const nodeEnv = configService.get<string>('NODE_ENV');

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
  console.log(`go to http://localhost:${port}/api for checking the endpoint`);
}
bootstrap();
