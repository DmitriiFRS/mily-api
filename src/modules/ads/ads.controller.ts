import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Query,
  Patch,
  UseGuards,
  Delete,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { AdsService } from './ads.service';
import { AdFilterDto } from './dto/ad-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AdMyFilterDto } from './dto/ad-my-filter.dto';
import { AdUpdateStatusDto } from './dto/ad-update-status.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { multerConfig } from '../uploads/multer.config';

@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get()
  async getAds(@Headers() headers: Record<string, string>, @Query() query: AdFilterDto) {
    const locale = headers['accept-language'] || 'ru';
    return this.adsService.getTranslatedAds({ locale, adFilterDto: query });
  }

  @Get('by-user/:id')
  async getAdsByUserId(
    @Headers() headers: Record<string, string>,
    @Param('id') id: number,
    @Query() query: AdMyFilterDto,
  ) {
    const locale = headers['accept-language'] || 'ru';
    return this.adsService.getMyAds({ userId: id, locale, adMyFilterDto: query, onlyActive: true });
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
  @Post('create')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async createAd(
    @GetUser('id') userId: number,
    @Body() dto: CreateAdDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.adsService.createAd(userId, dto, images);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:id')
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateAd(
    @GetUser('id') userId: number,
    @Param('id') id: number,
    @Body() dto: UpdateAdDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.adsService.updateAd(userId, id, dto, images);
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
