import { Module } from '@nestjs/common';
import { TranslationService } from './translations.service';

@Module({
  providers: [TranslationService],
})
export class TranslationsModule {}
