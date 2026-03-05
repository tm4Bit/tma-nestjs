import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodResponse } from 'nestjs-zod';
import { AppService } from './app.service';
import { HealthResponseDto } from './app.schemas';

@ApiTags('Check API Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  @ZodResponse({ status: 200, type: HealthResponseDto })
  async checkhealth(): Promise<HealthResponseDto> {
    return this.appService.checkhealth();
  }
}
