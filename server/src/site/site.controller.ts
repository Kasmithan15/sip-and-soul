import { Body, Controller, Get, Put } from '@nestjs/common';
import { AdminOnly } from '../auth/guards.js';
import { SiteContentDto } from './site.dto.js';
import { SiteService } from './site.service.js';

@Controller()
export class SiteController {
  constructor(private readonly site: SiteService) {}

  @Get('site')
  get() {
    return this.site.get();
  }

  @Put('admin/site')
  @AdminOnly()
  save(@Body() input: SiteContentDto) {
    return this.site.save(input);
  }
}
