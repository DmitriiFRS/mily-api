import { Body, Controller, Get, Headers, Param, Query, Patch, UseGuards, Delete } from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdFilterDto } from './dto/ad-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AdMyFilterDto } from './dto/ad-my-filter.dto';
import { AdUpdateStatusDto } from './dto/ad-update-status.dto';

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

  @UseGuards(JwtAuthGuard)
  @Patch('updateStatus/:id')
  async updateAdStatus(@GetUser('id') userId: number, @Param('id') id: number, @Body() dto: AdUpdateStatusDto) {
    return this.adsService.updateAdStatus(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete/:id')
  async deleteAd(@GetUser('id') userId: number, @Param('id') id: number) {
    return this.adsService.deleteAd(userId, id);
  }
}
