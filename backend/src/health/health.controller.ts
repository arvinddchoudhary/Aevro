import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

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
    } catch {
      throw new ServiceUnavailableException('Database connection failed');
    }
  }
}
