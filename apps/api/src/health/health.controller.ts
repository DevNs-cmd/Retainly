import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/auth.decorators';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.module';
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService, private readonly redis: RedisService) {}
  @Public() @Get()
  @ApiOperation({ summary: 'Check database and Redis readiness' })
  @ApiResponse({ status: 200, description: 'Dependencies are reachable' })
  @ApiResponse({ status: 503, description: 'Dependency unavailable' })
  async check() {
    try { await Promise.all([this.prisma.$queryRaw`SELECT 1`, this.redis.ping()]); }
    catch { throw new ServiceUnavailableException('Dependency unavailable'); }
    return { status: 'ok' };
  }
}
