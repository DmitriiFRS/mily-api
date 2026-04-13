import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationService } from 'src/common/service/pagination.service';
import { PrismaService } from 'src/core/prisma.service';
import { reviewsSelect } from './select/reviewsSelect';

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
}
