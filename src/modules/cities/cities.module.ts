import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { TranslationService } from '../translations/translations.service';
import { PaginationService } from 'src/common/service/pagination.service';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, TranslationService, PaginationService],
})
export class CitiesModule {}
