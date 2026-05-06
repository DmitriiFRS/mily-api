import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { TranslationService } from '../translations/translations.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginationService } from 'src/common/service/pagination.service';
import { CreateCityDto } from './dto/create-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAllCities({ locale }: { locale: string }) {
    const cities = await this.prisma.city.findMany();
    return this.translationService.translateDeep(cities, locale);
  }

  async adminGetAllCities({ locale, dto }: { locale: string; dto: PaginationDto }) {
    const cities = await this.paginationService.getPaginatedItems({
      modelName: 'City',
      page: dto.page,
      limit: dto.limit,
      params: {
        orderBy: { createdAt: 'desc' },
        include: {
          translations: true,
        },
      },
    });
    return this.translationService.translateDeep(cities, locale);
  }

  async adminGetCity({ id }: { id: number }) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });
    if (!city) {
      throw new NotFoundException('Город не найден');
    }
    return city;
  }

  async createCity({ dto }: { dto: CreateCityDto }) {
    const existingCity = await this.prisma.city.findFirst({
      where: {
        OR: [{ name: dto.name }, { code: dto.code }],
      },
    });
    if (existingCity) {
      throw new BadRequestException('Город с таким названием или кодом уже существует');
    }
    return this.prisma.city.create({ data: dto });
  }

  async updateCity({ dto, id }: { dto: CreateCityDto; id: number }) {
    const city = await this.prisma.city.findUnique({
      where: { id },
    });
    if (!city) {
      throw new NotFoundException('Город не найден');
    }
    const existingCity = await this.prisma.city.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: dto.name }, { code: dto.code }],
      },
    });
    if (existingCity) {
      throw new BadRequestException('Город с таким названием или кодом уже существует');
    }
    return this.prisma.city.update({ where: { id }, data: dto });
  }
  async deleteCity({ id }: { id: number }) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            adsAsOrigin: true,
            adsAsDestination: true,
            popularDirectionsAsOrigin: true,
            popularDirectionsAsDestination: true,
          },
        },
      },
    });
    if (!city) {
      throw new NotFoundException('Город не найден');
    }
    const isCityUsed =
      city._count.adsAsOrigin > 0 ||
      city._count.adsAsDestination > 0 ||
      city._count.popularDirectionsAsOrigin > 0 ||
      city._count.popularDirectionsAsDestination > 0;
    if (isCityUsed) {
      throw new ConflictException(
        'Нельзя удалить город, так как он используется в объявлениях или популярных направлениях',
      );
    }
    return this.prisma.city.delete({ where: { id } });
  }
}
