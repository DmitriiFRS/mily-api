import { Controller, Delete, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getNotifications(@GetUser('id') userId: number) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  async markAsRead(@GetUser('id') userId: number, @Param('id', ParseIntPipe) notificationId: number) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete-all')
  async deleteAllByUserId(@GetUser('id') userId: number) {
    return this.notificationsService.deleteAllByUserId(userId);
  }
}
