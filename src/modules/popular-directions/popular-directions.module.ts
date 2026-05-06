import { Module } from '@nestjs/common';
import { PopularDirectionsService } from './popular-directions.service';
import { PopularDirectionsController } from './popular-directions.controller';
import { TranslationService } from '../translations/translations.service';
import { PaginationService } from 'src/common/service/pagination.service';
import { UploadsService } from '../uploads/uploads.service';

@Module({
  controllers: [PopularDirectionsController],
  providers: [PopularDirectionsService, TranslationService, PaginationService, UploadsService],
})
export class PopularDirectionsModule {}
