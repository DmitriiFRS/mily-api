import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { TranslationService } from '../translations/translations.service';
import { PaginationService } from 'src/common/service/pagination.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { UploadsService } from '../uploads/uploads.service';
import { UpdateDirectionDto } from './dto/update-direction.dto';

@Injectable()
export class PopularDirectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
    private readonly paginationService: PaginationService,
    private readonly uploadService: UploadsService,
  ) {}

  async getAllPopularDirections({ locale }: { locale: string }) {
    const popularDirections = await this.prisma.popularDirection.findMany({
      include: {
        originCity: { include: { translations: true } },
        destinationCity: { include: { translations: true } },
      },
    });
    return this.translationService.translateDeep(popularDirections, locale);
  }

  async adminGetAllPopularDirections({ locale, dto }: { locale: string; dto: PaginationDto }) {
    const popularDirections = await this.paginationService.getPaginatedItems({
      modelName: 'PopularDirection',
      page: dto.page,
      limit: dto.limit,
      params: {
        orderBy: { createdAt: 'desc' },
        include: {
          imageFile: true,
          originCity: { include: { translations: true } },
          destinationCity: { include: { translations: true } },
        },
      },
    });
    return this.translationService.translateDeep(popularDirections, locale);
  }

  async adminGetPopularDirection({ id }: { id: number }) {
    const popularDirection = await this.prisma.popularDirection.findUnique({
      where: { id },
      include: {
        imageFile: true,
        originCity: { include: { translations: true } },
        destinationCity: { include: { translations: true } },
      },
    });
    if (!popularDirection) {
      throw new NotFoundException('Популярное направление не найдено');
    }
    return popularDirection;
  }

  async createDirection(dto: CreateDirectionDto, imageFile: Express.Multer.File) {
    const { destinationCityId, originCityId } = dto;

    const existingDirection = await this.prisma.popularDirection.findUnique({
      where: { originCityId_destinationCityId: { originCityId, destinationCityId } },
    });

    if (existingDirection) {
      throw new BadRequestException('Такое направление уже существует');
    }

    await this.prisma.$transaction(async (tx) => {
      const image = await this.uploadService.processAndUploadFile(imageFile, tx);

      await tx.popularDirection.create({
        data: {
          originCityId,
          destinationCityId,
          imageId: image.id,
        },
      });
    });
    return { message: 'Популярное направление успешно создано' };
  }

  async updateDirection(id: number, dto: UpdateDirectionDto, imageFile?: Express.Multer.File) {
    const { destinationCityId, originCityId, imageIdToDelete } = dto;

    const direction = await this.prisma.popularDirection.findUnique({
      where: { id },
      include: { imageFile: true },
    });
    if (!direction) {
      throw new NotFoundException('Популярное направление не найдено');
    }

    await this.prisma.$transaction(async (tx) => {
      let imageFileId: number | null = direction.imageFile?.id || null;
      if (imageIdToDelete) {
        await this.uploadService.deleteFile(imageIdToDelete, tx);
      }
      if (imageFile) {
        const image = await this.uploadService.processAndUploadFile(imageFile, tx);
        imageFileId = image.id;
      }
      return await tx.popularDirection.update({
        where: { id },
        data: {
          originCityId,
          destinationCityId,
          imageId: imageFileId,
        },
      });
    });
    return { message: 'Популярное направление успешно обновлено' };
  }

  async deleteDirection(id: number) {
    const direction = await this.prisma.popularDirection.findUnique({
      where: { id },
      include: { imageFile: true },
    });
    if (!direction) {
      throw new NotFoundException('Популярное направление не найдено');
    }

    await this.prisma.$transaction(async (tx) => {
      if (direction.imageId) {
        await this.uploadService.deleteFile(+direction.imageId, tx);
      }
      await tx.popularDirection.delete({ where: { id } });
    });
    return { message: 'Популярное направление успешно удалено' };
  }
}
