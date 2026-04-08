import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtPayload } from 'src/types/jwt/jwt-payload.type';
import { RefreshTokenDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  jwtService: any;
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser('id') userId: number): Promise<void> {
    return this.authService.logout(userId);
  }

  @Post('refresh')
  async refreshTokens(
    @Body() dto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decodedToken = this.jwtService.decode(dto.refreshToken) as JwtPayload;
    if (!decodedToken || !decodedToken.sub) {
      throw new ForbiddenException('Некорректный токен');
    }

    return await this.authService.refreshTokens(
      decodedToken.sub,
      dto.refreshToken,
    );
  }
}
