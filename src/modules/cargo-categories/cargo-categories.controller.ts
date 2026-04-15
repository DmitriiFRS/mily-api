import { Controller, Get, Headers } from '@nestjs/common';
import { CargoCategoriesService } from './cargo-categories.service';

@Controller('cargo-categories')
export class CargoCategoriesController {
  constructor(private readonly cargoCategoriesService: CargoCategoriesService) {}

  @Get()
  getAllCategories(@Headers() headers: Record<string, string>) {
    const locale = headers['accept-language'] || 'ru';
    return this.cargoCategoriesService.getAllCategories({ locale });
  }
}
