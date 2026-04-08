import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Role, User } from 'generated/prisma/client';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly paginationService: PaginationService,
  ) {}

  async findByEmailOrPhone(
    email?: string,
    phoneNumber?: string,
  ): Promise<(User & { role: Role }) | null> {
    const conditions: Prisma.UserWhereInput[] = [];
    if (email) conditions.push({ email });
    if (phoneNumber) conditions.push({ phoneNumber });
    if (conditions.length === 0) {
      throw new BadRequestException(
        'Необходимо указать email или номер телефона',
      );
    }
    const user = await this.prisma.user.findFirst({
      where: { OR: conditions },
      include: { role: true },
    });
    return user;
  }
}
