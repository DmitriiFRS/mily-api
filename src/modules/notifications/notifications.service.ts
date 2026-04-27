import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { DeviceType } from 'generated/prisma/enums';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly expo = new Expo();

  constructor(private readonly prisma: PrismaService) {}

  async sendPushToUser(userId: number, title: string, body: string, data?: any) {
    if (!userId) return;
    const deviceTokens = await this.prisma.deviceToken.findMany({
      where: { userId },
    });
    if (!deviceTokens.length) return;
    const mobileTokens = deviceTokens.filter((dt) => dt.device === DeviceType.MOBILE).map((dt) => dt.token);
    if (mobileTokens.length > 0) {
      await this.sendExpoNotifications(mobileTokens, title, body, data);
    }
  }

  private async sendExpoNotifications(tokens: string[], title: string, body: string, data?: any) {
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));
    if (!validTokens.length) return;
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    const tickets = await this.expo.sendPushNotificationsAsync(messages);
    const deadTokens: string[] = [];
    tickets.forEach((ticket, index) => {
      if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        deadTokens.push(validTokens[index]);
      }
    });
    if (deadTokens.length > 0) {
      await this.prisma.deviceToken.deleteMany({
        where: { token: { in: deadTokens } },
      });
    }
  }
}
