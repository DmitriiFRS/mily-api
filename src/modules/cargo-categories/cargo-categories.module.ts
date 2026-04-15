import { Module } from '@nestjs/common';
import { CargoCategoriesService } from './cargo-categories.service';
import { CargoCategoriesController } from './cargo-categories.controller';
import { TranslationService } from '../translations/translations.service';

@Module({
  controllers: [CargoCategoriesController],
  providers: [CargoCategoriesService, TranslationService],
})
export class CargoCategoriesModule {}
