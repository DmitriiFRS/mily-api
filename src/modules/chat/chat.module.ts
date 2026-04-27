import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/core/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, PrismaService, NotificationsService, ConfigService],
})
export class ChatModule {}
