import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { TranslationService } from '../translations/translations.service';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, TranslationService],
})
export class CitiesModule {}
