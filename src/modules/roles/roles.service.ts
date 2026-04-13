import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicRoles() {
    return this.prisma.role.findMany({
      where: {
        isAdmin: false,
      },
      include: {
        translations: true,
      },
    });
  }
}
