import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { TranslationService } from '../translations/translations.service';
import { PaginationService } from 'src/common/service/pagination.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CargoCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAllCategories({ locale }: { locale: string }) {
    const categories = await this.prisma.cargoCategory.findMany();
    return this.translationService.translateDeep(categories, locale);
  }

  async adminGetAllCategories({ locale, dto }: { locale: string; dto: PaginationDto }) {
    const categories = await this.paginationService.getPaginatedItems({
      modelName: 'CargoCategory',
      page: dto.page,
      limit: dto.limit,
      params: {
        orderBy: { createdAt: 'desc' },
        include: {
          translations: true,
        },
      },
    });
    return this.translationService.translateDeep(categories, locale);
  }

  async adminGetCategory({ id }: { id: number }) {
    const category = await this.prisma.cargoCategory.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    return category;
  }

  async createCategory({ dto }: { dto: CreateCategoryDto }) {
    const existingCategory = await this.prisma.cargoCategory.findFirst({
      where: {
        name: dto.name,
      },
    });
    if (existingCategory) {
      throw new BadRequestException('Категория с таким названием уже существует');
    }
    return this.prisma.cargoCategory.create({ data: dto });
  }

  async updateCategory({ dto, id }: { dto: CreateCategoryDto; id: number }) {
    const category = await this.prisma.cargoCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    const existingCategory = await this.prisma.cargoCategory.findFirst({
      where: {
        id: { not: id },
        name: dto.name,
      },
    });
    if (existingCategory) {
      throw new BadRequestException('Категория с таким названием уже существует');
    }
    return this.prisma.cargoCategory.update({ where: { id }, data: dto });
  }

  async deleteCategory({ id }: { id: number }) {
    const category = await this.prisma.cargoCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            ads: true,
          },
        },
      },
    });
    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }
    const isCategoryUsed = category._count.ads > 0;
    if (isCategoryUsed) {
      throw new ConflictException('Нельзя удалить категорию, так как она используется в объявлениях');
    }
    return this.prisma.cargoCategory.delete({ where: { id } });
  }
}
