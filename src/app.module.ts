import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './core/prisma.service';
import { PrismaModule } from './core/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdsModule } from './modules/ads/ads.module';
import { RolesModule } from './modules/roles/roles.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CargoCategoriesModule } from './modules/cargo-categories/cargo-categories.module';
import { CitiesModule } from './modules/cities/cities.module';
import { ChatModule } from './modules/chat/chat.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MailModule } from './modules/mail/mail.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    AdsModule,
    RolesModule,
    ReviewsModule,
    CargoCategoriesModule,
    CitiesModule,
    ChatModule,
    UploadsModule,
    MailModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
