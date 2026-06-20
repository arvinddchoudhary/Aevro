import {
  Controller,
  Get,
  Inject,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'aevro-api',
      stack: 'nestjs',
    };
  }

  @Get('database')
  async getDatabaseHealth() {
    try {
      await this.prisma.isHealthy();

      return {
        status: 'ok',
        database: 'connected',
        provider: 'postgresql',
      };
    } catch (error) {
      this.logger.error(
        'Database health check failed',
        error instanceof Error ? error.stack : String(error),
      );

      throw new ServiceUnavailableException('Database connection failed');
    }
  }
}
