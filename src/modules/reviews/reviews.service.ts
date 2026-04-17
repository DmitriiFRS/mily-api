import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationService } from 'src/common/service/pagination.service';
import { PrismaService } from 'src/core/prisma.service';
import { reviewsSelect } from './select/reviewsSelect';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async getReviewsByUserId(userId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 2 } = paginationDto;
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const reviews = await this.paginationService.getPaginatedItems({
      modelName: 'Review',
      page,
      limit,
      params: {
        orderBy: { createdAt: 'desc' },
        where: {
          receiverId: user.id,
        },
        select: reviewsSelect,
      },
    });
    return reviews;
  }

  async createReview(reviewDto: CreateReviewDto, senderId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: senderId },
    });
    if (!user) {
      throw new NotFoundException('Отправитель отзыва не найден');
    }
    if (senderId === reviewDto.receiverId) {
      throw new BadRequestException('Нельзя оставить отзыв самому себе');
    }
    return await this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          text: reviewDto.text,
          rating: reviewDto.rating,
          senderId: senderId,
          receiverId: reviewDto.receiverId,
        },
      });
      const user = await tx.user.findUnique({
        where: { id: reviewDto.receiverId },
        select: { reviewsCount: true, ratingSum: true },
      });
      if (!user) {
        throw new NotFoundException('Получатель отзыва не найден');
      }
      const newReviewsCount = user.reviewsCount + 1;
      const newRatingSum = user.ratingSum + reviewDto.rating;
      const newRating = parseFloat((newRatingSum / newReviewsCount).toFixed(1));
      await tx.user.update({
        where: { id: reviewDto.receiverId },
        data: {
          reviewsCount: newReviewsCount,
          ratingSum: newRatingSum,
          rating: newRating,
        },
      });
      return review;
    });
  }
}
