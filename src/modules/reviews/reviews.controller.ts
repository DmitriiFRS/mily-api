import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyReviews(@GetUser('id') userId: number, @Query() query: PaginationDto) {
    return this.reviewsService.getReviewsByUserId(userId, query);
  }

  @Get('by-user/:userId')
  async getReviewsByUserId(@Param('userId') userId: number, @Query() query: PaginationDto) {
    return this.reviewsService.getReviewsByUserId(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createReview(@Body() reviewDto: CreateReviewDto, @GetUser('id') senderId: number) {
    return this.reviewsService.createReview(reviewDto, senderId);
  }
}
