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

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AdsModule, RolesModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
