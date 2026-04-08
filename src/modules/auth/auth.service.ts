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
import { Role, User } from 'generated/prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phoneNumber) {
      throw new BadRequestException(
        'Необходимо указать email или номер телефона',
      );
    }
    const existingUser = await this.usersService.findByEmailOrPhone(
      dto.email,
      dto.phoneNumber,
    );
    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким email или номером телефона уже существует',
      );
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
        isVerified: true,
        about: '',
      },
      include: {
        role: true,
      },
    });
    return {
      user,
      message: 'Регистрация прошла успешно!',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailOrPhone(
      dto.email,
      dto.phoneNumber,
    );
    if (!user || !user.password) {
      throw new UnauthorizedException(
        'Неверный email, номер телефона или пароль',
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Неверный email, номер телефона или пароль',
      );
    }
    if (!user.isVerified) {
      throw new ForbiddenException(
        'Email не подтвержден. Пожалуйста, проверьте почту.',
      );
    }
    return this.loginUser(user);
  }

  private async loginUser(user: User & { role: Role }) {
    const tokens = await this.getTokens(user.id, user.email, user.phoneNumber);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        roleId: user.roleId,
        isVerified: user.isVerified,
      },
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
    const tokens = await this.getTokens(user.id, user.email, user.phoneNumber);
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

  private async getTokens(
    userId: number,
    email: string | null,
    phoneNumber: string | null,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          phoneNumber,
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
          phoneNumber,
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
}
