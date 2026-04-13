import { Controller, Get, Headers, Param, Query, UseGuards } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdFilterDto } from './dto/ad-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AdMyFilterDto } from './dto/ad-my-filter.dto';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  async getAds(@Headers() headers: Record<string, string>, @Query() query: AdFilterDto) {
    const locale = headers['accept-language'] || 'ru';
    return this.adsService.getTranslatedAds({ locale, adFilterDto: query });
  }

  @Get('getById/:id')
  async getAdById(@Headers() headers: Record<string, string>, @Param('id') id: number) {
    const locale = headers['accept-language'] || 'ru';
    return this.adsService.getAdById(id, locale);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyAds(
    @Headers() headers: Record<string, string>,
    @GetUser('id') userId: number,
    @Query() query: AdMyFilterDto,
  ) {
    const locale = headers['accept-language'] || 'ru';
    return this.adsService.getMyAds({ userId, locale, adMyFilterDto: query });
  }
}
