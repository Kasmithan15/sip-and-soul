import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { AdminOnly } from '../auth/guards.js';
import { ProductDto } from './menu.dto.js';
import { MenuService } from './menu.service.js';

@Controller()
export class MenuController {
  constructor(private readonly menu: MenuService) {}

  @Get('menu')
  list() {
    return this.menu.list(false);
  }

  @Get('admin/menu')
  @AdminOnly()
  listAll() {
    return this.menu.list(true);
  }

  @Post('admin/menu')
  @AdminOnly()
  create(@Body() input: ProductDto) {
    return this.menu.create(input);
  }

  @Patch('admin/menu/:id')
  @AdminOnly()
  update(@Param('id', ParseUUIDPipe) id: string, @Body() input: ProductDto) {
    return this.menu.update(id, input);
  }

  @Delete('admin/menu/:id')
  @HttpCode(204)
  @AdminOnly()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.menu.remove(id);
  }
}
