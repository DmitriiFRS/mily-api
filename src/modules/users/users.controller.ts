import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateMeDto } from './dto/update-me.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../uploads/multer.config';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@GetUser('id') userId: number) {
    return this.usersService.getMe(userId);
  }

  @Get('/GetUserById/:userId')
  async getUserById(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.getUserById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@GetUser('id') userId: number, @Body() data: UpdateMeDto) {
    return this.usersService.updateMe(userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async updateMeAvatar(@GetUser('id') userId: number, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не предоставлен или формат не поддерживается');
    }
    return this.usersService.updateMeAvatar(userId, file);
  }
}
