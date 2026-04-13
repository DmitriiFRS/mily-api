import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getReviewsByUserId(@GetUser('id') userId: number, @Query() query: PaginationDto) {
    return this.reviewsService.getReviewsByUserId(userId, query);
  }
}
