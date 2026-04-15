import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';
import { TranslationService } from '../translations/translations.service';

@Injectable()
export class CargoCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly translationService: TranslationService,
  ) {}

  async getAllCategories({ locale }: { locale: string }) {
    const categories = await this.prisma.cargoCategory.findMany();
    return this.translationService.translateDeep(categories, locale);
  }
}
