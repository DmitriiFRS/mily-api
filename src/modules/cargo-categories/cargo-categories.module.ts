import { Module } from '@nestjs/common';
import { CargoCategoriesService } from './cargo-categories.service';
import { CargoCategoriesController } from './cargo-categories.controller';
import { TranslationService } from '../translations/translations.service';
import { PaginationService } from 'src/common/service/pagination.service';

@Module({
  controllers: [CargoCategoriesController],
  providers: [CargoCategoriesService, TranslationService, PaginationService],
})
export class CargoCategoriesModule {}
