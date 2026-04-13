import { Module } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdsController } from './ads.controller';
import { TranslationService } from '../translations/translations.service';
import { UploadsService } from '../uploads/uploads.service';
import { PaginationService } from 'src/common/service/pagination.service';

@Module({
  controllers: [AdsController],
  providers: [
    AdsService,
    TranslationService,
    UploadsService,
    PaginationService,
  ],
})
export class AdsModule {}
