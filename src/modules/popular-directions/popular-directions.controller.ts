import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PopularDirectionsService } from './popular-directions.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../uploads/multer.config';
import { CreateDirectionDto } from './dto/create-direction.dto';
import { AdminOnly } from 'src/common/decorators/admin-only.decorator';

@Controller('popular-directions')
export class PopularDirectionsController {
  constructor(private readonly popularDirectionsService: PopularDirectionsService) {}

  @Get()
  getAllPopularDirections(@Headers() headers: Record<string, string>) {
    const locale = headers['accept-language'] || 'ru';
    return this.popularDirectionsService.getAllPopularDirections({ locale });
  }

  @Get('admin')
  adminGetAllPopularDirections(@Headers() headers: Record<string, string>, @Param() dto: PaginationDto) {
    const locale = headers['accept-language'] || 'ru';
    return this.popularDirectionsService.adminGetAllPopularDirections({ locale, dto });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Get('admin/:id')
  adminGetPopularDirection(@Param('id') id: number) {
    return this.popularDirectionsService.adminGetPopularDirection({ id });
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Post('create')
  @UseInterceptors(FileInterceptor('imageFile', multerConfig))
  async createDirection(@Body() dto: CreateDirectionDto, @UploadedFile() imageFile: Express.Multer.File) {
    return await this.popularDirectionsService.createDirection(dto, imageFile);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Patch('update/:id')
  @UseInterceptors(FileInterceptor('imageFile', multerConfig))
  async updateDirection(
    @Param('id') id: number,
    @Body() dto: CreateDirectionDto,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return await this.popularDirectionsService.updateDirection(id, dto, imageFile);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @AdminOnly()
  @Delete('delete/:id')
  async deleteDirection(@Param('id') id: number) {
    return await this.popularDirectionsService.deleteDirection(id);
  }
}
