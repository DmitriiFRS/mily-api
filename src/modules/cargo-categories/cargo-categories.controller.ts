import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CargoCategoriesService } from './cargo-categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('cargo-categories')
export class CargoCategoriesController {
  constructor(private readonly cargoCategoriesService: CargoCategoriesService) {}

  @Get()
  getAllCategories(@Headers() headers: Record<string, string>) {
    const locale = headers['accept-language'] || 'ru';
    return this.cargoCategoriesService.getAllCategories({ locale });
  }

  @Get('admin')
  adminGetAllCategories(@Headers() headers: Record<string, string>, @Query() dto: PaginationDto) {
    const locale = headers['accept-language'] || 'ru';
    return this.cargoCategoriesService.adminGetAllCategories({ locale, dto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Get('admin/:id')
  adminGetCategory(@Param('id') id: number) {
    return this.cargoCategoriesService.adminGetCategory({ id });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post('create')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.cargoCategoriesService.createCategory({ dto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Patch('update/:id')
  async updateCategory(@Param('id') id: number, @Body() dto: CreateCategoryDto) {
    return await this.cargoCategoriesService.updateCategory({ id, dto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Delete('delete/:id')
  async deleteCategory(@Param('id') id: number) {
    return await this.cargoCategoriesService.deleteCategory({ id });
  }
}
