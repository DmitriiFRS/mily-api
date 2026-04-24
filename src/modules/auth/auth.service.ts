import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/prisma.service';
import { EnvironmentVariables } from 'src/types/env/EnvironmentVariables.type';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role, TokenType, User } from 'generated/prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException('Необходимо указать email или номер телефона');
    }

    if (dto.email) {
      const existingByEmail = await this.usersService.findByEmail(dto.email);
      if (existingByEmail) {
        throw new ConflictException('Пользователь с таким email уже существует');
      }
    }
    if (dto.phoneNumber) {
      const existingByPhone = await this.usersService.findByPhone(dto.phoneNumber);
      if (existingByPhone) {
        throw new ConflictException('Пользователь с таким номером телефона уже существует');
      }
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        password: hashedPassword,
        name: dto.name,
        roleId: 1,
        isVerified: false,
        about: '',
      },
      include: {
        role: true,
      },
    });

    if (user.email) {
      const token = uuidv4();
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);

      await this.prisma.token.create({
        data: {
          token: token,
          type: TokenType.EMAIL_VERIFICATION,
          expiresAt: expires,
          userId: user.id,
        },
      });

      await this.mailService.sendVerificationEmail(user.email, token);
    }

    return {
      user,
      message: 'Регистрация прошла успешно! Проверьте вашу почту для подтверждения аккаунта.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    if (!user.isVerified) {
      throw new ForbiddenException({
        errorCode: 'EMAIL_NOT_VERIFIED',
        message: 'Email не подтвержден. Пожалуйста, проверьте почту.',
        email: user.email,
      });
    }
    return this.loginUser(user);
  }

  private async loginUser(user: User & { role: Role }) {
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    const userMe = await this.usersService.getMe(user.id);
    return {
      user: userMe,
      ...tokens,
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.hashedRefreshToken) {
      throw new ForbiddenException('Доступ запрещен.');
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Срок действия Refresh Token истек');
    }
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshTokenMatches = hash === user.hashedRefreshToken;

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Доступ запрещен.');
    }
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  private async getTokens(userId: number, email: string | null) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          jti: uuidv4(),
        },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          jti: uuidv4(),
        },
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
        },
      ),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hash },
    });
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const passwordResetMessage =
      'Если такой email существует, мы отправили на него инструкцию по восстановлению пароля.';
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      return { message: passwordResetMessage };
    }
    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.prisma.$transaction(async (tx) => {
      await tx.token.deleteMany({
        where: {
          userId: user.id,
          type: TokenType.PASSWORD_RESET,
        },
      });

      await tx.token.create({
        data: {
          token: token,
          type: TokenType.PASSWORD_RESET,
          expiresAt: expires,
          userId: user.id,
        },
      });
    });
    await this.mailService.sendPasswordResetEmail(dto.email, token);
    return { message: passwordResetMessage };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenRecord = await this.prisma.token.findFirst({
      where: {
        token: dto.token,
        type: TokenType.PASSWORD_RESET,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });
    if (!tokenRecord) {
      throw new BadRequestException('Неверный или просроченный токен сброса пароля');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: {
          password: hashedPassword,
          hashedRefreshToken: null,
        },
      });

      await tx.token.deleteMany({
        where: {
          userId: tokenRecord.userId,
          type: TokenType.PASSWORD_RESET,
        },
      });
    });
    return { message: 'Пароль успешно изменен' };
  }

  async verifyEmail(token: string) {
    const tokenRecord = await this.prisma.token.findFirst({
      where: {
        token: token,
        type: TokenType.EMAIL_VERIFICATION,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: { role: true },
        },
      },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Неверный или просроченный токен подтверждения');
    }
    const user = tokenRecord.user;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
        },
      });

      await tx.token.deleteMany({
        where: {
          userId: user.id,
          type: TokenType.EMAIL_VERIFICATION,
        },
      });
    });

    return this.loginUser(user);
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    if (user.isVerified) {
      throw new ConflictException('Аккаунт уже подтвержден');
    }
    const token = uuidv4();
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await this.prisma.$transaction(async (tx) => {
      await tx.token.deleteMany({
        where: {
          userId: user.id,
          type: TokenType.EMAIL_VERIFICATION,
        },
      });

      await tx.token.create({
        data: {
          token: token,
          type: TokenType.EMAIL_VERIFICATION,
          expiresAt: expires,
          userId: user.id,
        },
      });
    });
    await this.mailService.sendVerificationEmail(email, token);
    return { message: 'Письмо с подтверждением отправлено повторно.' };
  }
}
