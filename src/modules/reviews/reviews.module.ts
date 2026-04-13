import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PaginationService } from 'src/common/service/pagination.service';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, PaginationService],
})
export class ReviewsModule {}
