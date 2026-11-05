import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { AppModule } from './app.module.js';
import { allowedOrigins } from './security/origin.guard.js';

/** Turns nested validation errors into { field: message } so the forms can show each message under its field. */
function flatten(errors: ValidationError[], parent = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const e of errors) {
    const path = parent ? `${parent}.${e.property}` : e.property;
    if (e.constraints) out[path] = Object.values(e.constraints)[0];
    if (e.children?.length) Object.assign(out, flatten(e.children, path));
  }
  return out;
}

async function bootstrap() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL must be configured.');
  if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) throw new Error('JWT_SECRET must contain at least 32 bytes.');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Hosted behind Railway's proxy: rate-limit by the visitor's IP, not the proxy's.
  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'"],
        workerSrc: ["'self'", 'blob:'],
      },
    },
  }));
  app.use(cookieParser());
  app.enableCors({ origin: allowedOrigins(), credentials: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => {
      const fields = flatten(errors);
      return new BadRequestException({ message: Object.values(fields)[0] ?? 'Please check the form.', fields });
    },
  }));

  // In production the API also serves the built website, so everything runs as one service.
  const site = resolve(process.env.FRONTEND_DIST ?? join(process.cwd(), '../dist'));
  if (existsSync(join(site, 'index.html'))) {
    app.useStaticAssets(site, { index: false });
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.sendFile(join(site, 'index.html'));
    });
  }

  await app.listen(process.env.PORT ?? 3001);
}
await bootstrap();
