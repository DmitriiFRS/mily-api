import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, Role, User } from 'generated/prisma/client';
import { PrismaService } from 'src/core/prisma.service';
import { getMeSelect } from './select/getMeSelect';
import { UpdateMeDto } from './dto/update-me.dto';
import { UploadsService } from '../uploads/uploads.service';
import { getUserByIdSelect } from './select/getUserByIdSelect';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    // private readonly paginationService: PaginationService,
    private readonly uploadsService: UploadsService,
  ) {}

  async findByEmailOrPhone(email?: string, phoneNumber?: string): Promise<(User & { role: Role }) | null> {
    if (!email && !phoneNumber) {
      throw new BadRequestException('Необходимо указать email или номер телефона');
    }

    // Приоритет: если указан email — ищем строго по email,
    // иначе — строго по phoneNumber.
    // OR не используем, чтобы не вернуть чужого пользователя.
    const where: Prisma.UserWhereInput = email ? { email } : { phoneNumber };

    const user = await this.prisma.user.findFirst({
      where,
      include: { role: true },
    });
    return user;
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: getMeSelect,
    });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    return user;
  }

  async updateMe(userId: number, data: UpdateMeDto) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const roles = await this.prisma.role.findMany({
      where: { id: { lte: 99 } },
    });
    if (!currentUser) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    if (data.roleId && !roles.find((role) => role.id === data.roleId)) {
      throw new BadRequestException('Неверная роль');
    }

    if (data.email && data.email !== currentUser.email) {
      const existingUser = await this.findByEmailOrPhone(data.email);
      if (existingUser) {
        throw new BadRequestException('Email уже занят');
      }
    }

    if (data.phoneNumber && data.phoneNumber !== currentUser.phoneNumber) {
      const existingUser = await this.findByEmailOrPhone(undefined, data.phoneNumber);
      if (existingUser) {
        throw new BadRequestException('Номер телефона уже занят');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: getMeSelect,
    });

    return updatedUser;
  }

  async updateMeAvatar(userId: number, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarFileId: true },
    });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const newFile = await this.uploadsService.processAndUploadFile(file, tx);
      const updated = await tx.user.update({
        where: { id: userId },
        data: { avatarFileId: newFile.id },
        select: getMeSelect,
      });
      if (user.avatarFileId) {
        await this.uploadsService.deleteFile(user.avatarFileId, tx);
      }
      return updated;
    });
    return updatedUser;
  }

  async getUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: getUserByIdSelect,
    });
    if (!user) {
      throw new BadRequestException('Пользователь не найден');
    }
    return user;
  }
}
