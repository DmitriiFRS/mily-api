import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { TranslationService } from '../translations/translations.service';

@Injectable()
export class CitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
  ) {}

  async getAllCities({ locale }: { locale: string }) {
    const cities = await this.prisma.city.findMany();
    return this.translationService.translateDeep(cities, locale);
  }
}
