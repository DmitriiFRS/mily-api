import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { TranslationService } from '../translations/translations.service';
import { UploadsService } from '../uploads/uploads.service';
import { PaginationService } from 'src/common/service/pagination.service';
import { AdFilterDto } from './dto/ad-filter.dto';
import { AdStatus, AdType, Prisma } from 'generated/prisma/client';
import { AdMyFilterDto } from './dto/ad-my-filter.dto';
import { AdUpdateStatusDto } from './dto/ad-update-status.dto';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';

@Injectable()
export class AdsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
    private readonly uploadService: UploadsService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAds({ adFilterDto }: { adFilterDto: AdFilterDto }) {
    const { page = 1, limit = 6, date, from, to, cargoType, weight } = adFilterDto;

    const where: Prisma.AdWhereInput = {};

    where.status = AdStatus.ACTIVE;

    if (from) {
      where.originCity = {
        name: {
          contains: from,
        },
      };
    }

    if (to) {
      where.destinationCity = {
        name: {
          contains: to,
        },
      };
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.dateFrom = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (weight) {
      where.weightKg = weight;
    }

    if (cargoType) {
      where.cargoCategory = {
        name: {
          contains: cargoType,
        },
      };
    }
    const ads = await this.paginationService.getPaginatedItems({
      modelName: 'Ad',
      page,
      limit,
      params: {
        orderBy: { createdAt: 'desc' },
        include: {
          images: true,
          translations: true,
          originCity: true,
          destinationCity: true,
          author: {
            include: {
              avatarFile: true,
            },
          },
        },
        where,
      },
    });
    return ads;
  }

  async getMyAds({ userId, locale, adMyFilterDto }: { userId: number; locale: string; adMyFilterDto: AdMyFilterDto }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    const { cargoType, cargoStatus, page, limit } = adMyFilterDto;
    const where: Prisma.AdWhereInput = {};

    where.authorId = {
      equals: userId,
    };
    where.type = {
      equals: cargoType,
    };
    if (cargoStatus) {
      where.status = {
        equals: cargoStatus,
      };
    }

    const ads = await this.paginationService.getPaginatedItems({
      modelName: 'Ad',
      page,
      limit,
      params: {
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            include: {
              file: true,
            },
          },
          translations: true,
          originCity: true,
          destinationCity: true,
          author: {
            include: {
              avatarFile: true,
            },
          },
          cargoCategory: true,
        },
        where,
      },
    });
    return {
      data: this.translationService.translateDeep(ads.data, locale),
      meta: ads.meta,
    };
  }

  async getTranslatedAds({ locale, adFilterDto }: { locale: string; adFilterDto: AdFilterDto }) {
    const { data, meta } = await this.getAds({ adFilterDto });
    return {
      data: this.translationService.translateDeep(data, locale),
      meta,
    };
  }

  async getAdById(id: number, locale: string) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { images: true, translations: true },
    });
    if (!ad) {
      throw new NotFoundException('Ad with id ' + id + ' not found');
    }
    const data = this.translationService.translateDeep(ad, locale);
    return { ...data, translations: ad.translations };
  }

  async updateAdStatus(userId: number, id: number, dto: AdUpdateStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    const ad = await this.prisma.ad.update({
      where: { id, authorId: userId },
      data: { status: dto.status },
    });
    if (!ad) {
      throw new NotFoundException('Объявление не найдено');
    }
    return ad;
  }

  async deleteAd(userId: number, id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!ad) {
      throw new NotFoundException('Объявление не найдено');
    }
    if (ad.authorId !== userId) {
      throw new ForbiddenException('У вас нет прав на удаление этого объявления');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const image of ad.images) {
        await this.uploadService.deleteFile(image.fileId, tx);
      }
      await tx.ad.delete({
        where: { id },
      });
    });
    return { message: 'Объявление успешно удалено' };
  }

  async createAd(userId: number, dto: CreateAdDto, images: Express.Multer.File[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    let adType: AdType | null = null;
    if (dto.dateTo) {
      adType = AdType.TRANSPORT;
    }
    if (!dto.dateTo) {
      adType = AdType.CARGO;
    }
    if (!adType) {
      throw new BadRequestException('Не удалось определить тип объявления');
    }

    await this.prisma.$transaction(async (tx) => {
      const uploadedFiles = await this.uploadService.processAndUploadFiles(images, tx);
      await tx.ad.create({
        data: {
          authorId: userId,
          status: AdStatus.ACTIVE,
          ...dto,
          images: {
            create: uploadedFiles.map((file, index) => ({
              fileId: file.id,
              order: index,
            })),
          },
        },
      });
    });
    return { message: 'Объявление успешно создано' };
  }

  async updateAd(userId: number, id: number, dto: UpdateAdDto, images: Express.Multer.File[]) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!ad) {
      throw new NotFoundException('Объявление не найдено');
    }
    if (ad.authorId !== userId) {
      throw new ForbiddenException('У вас нет прав на обновление этого объявления');
    }
    const { imgIdsToDelete, ...updateData } = dto;
    return await this.prisma.$transaction(async (tx) => {
      if (imgIdsToDelete && imgIdsToDelete.length > 0) {
        for (const fileId of imgIdsToDelete) {
          await this.uploadService.deleteFile(fileId, tx);
        }
        await tx.adImage.deleteMany({
          where: {
            adId: id,
            fileId: { in: imgIdsToDelete },
          },
        });
      }

      let newImagesData: { fileId: number; order: number }[] = [];
      if (images && images.length > 0) {
        const uploadedFiles = await this.uploadService.processAndUploadFiles(images, tx);
        const currentImagesCount = await tx.adImage.count({ where: { adId: id } });
        newImagesData = uploadedFiles.map((file, index) => ({
          fileId: file.id,
          order: currentImagesCount + index,
        }));
      }
      return await tx.ad.update({
        where: { id },
        data: {
          ...updateData,
          images: {
            create: newImagesData,
          },
        },
      });
    });
  }
}
