import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { CreateCityDto } from './dto/create-city.dto';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  getAllCities(@Headers() headers: Record<string, string>) {
    const locale = headers['accept-language'] || 'ru';
    return this.citiesService.getAllCities({ locale });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Get('admin')
  adminGetAllCities(@Headers() headers: Record<string, string>, @Query() dto: PaginationDto) {
    const locale = headers['accept-language'] || 'ru';
    return this.citiesService.adminGetAllCities({ locale, dto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Get('admin/:id')
  adminGetCity(@Param('id') id: number) {
    return this.citiesService.adminGetCity({ id });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post('create')
  async createCity(@Body() dto: CreateCityDto) {
    return await this.citiesService.createCity({ dto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Patch('update/:id')
  async updateCity(@Param('id') id: number, @Body() dto: CreateCityDto) {
    return await this.citiesService.updateCity({ id, dto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Delete('delete/:id')
  async deleteCity(@Param('id') id: number) {
    return await this.citiesService.deleteCity({ id });
  }
}
