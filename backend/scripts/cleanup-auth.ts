import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const authService = app.get(AuthService);
    const result = await authService.cleanupExpiredAuthRows();

    console.log('AUTH_CLEANUP_COMPLETE', result);
  } finally {
    await app.close();
  }
}

void main().catch((error) => {
  console.error(
    'AUTH_CLEANUP_FAILED',
    error instanceof Error ? error.message : String(error),
  );
  process.exit(1);
});
