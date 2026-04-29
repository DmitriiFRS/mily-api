import { Body, Controller, ForbiddenException, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RefreshTokenDto } from './dto/refresh.dto';
import { JwtService } from '@nestjs/jwt';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/types/env/EnvironmentVariables.type';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { LogoutDto } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}
  @Get('ping')
  @UseGuards(JwtAuthGuard)
  ping() {
    return { status: 'ok' };
  }
  // ==============================================================================

  @Get('redirect')
  redirectToExp(@Query('token') token: string, @Res() res: Response) {
    const expoUrl = this.configService.get('EXPO_APP_URL');

    const finalUrl = `${expoUrl}/verify?token=${token}`;

    return res.redirect(finalUrl);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('resend-verification')
  async resendVerification(@Body('email') email: string) {
    return await this.authService.resendVerificationEmail(email);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser('id') userId: number, @Body() dto: LogoutDto): Promise<void> {
    return this.authService.logout(userId, dto.token);
  }

  @Post('refresh')
  async refreshTokens(@Body() dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    const decodedToken = this.jwtService.decode(dto.refreshToken);
    if (!decodedToken || !decodedToken.sub) {
      throw new ForbiddenException('Некорректный токен');
    }

    return await this.authService.refreshTokens(decodedToken.sub, dto.refreshToken, dto.deviceToken);
  }
}
