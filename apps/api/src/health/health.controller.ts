import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  service: string;
  environment: string;
  database: 'up' | 'down';
  timestamp: string;
  uptime: number;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Check API service and database health' })
  @ApiOkResponse({
    description: 'Returns service and database health status',
  })
  async check(): Promise<HealthCheckResponse> {
    const dbHealthy = await this.prismaService.isHealthy();

    return {
      status: dbHealthy ? 'ok' : 'degraded',
      service: 'wonder-pets-api',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      database: dbHealthy ? 'up' : 'down',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    };
  }
}
