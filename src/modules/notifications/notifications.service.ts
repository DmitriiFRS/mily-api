import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { DeviceType, NotificationType } from 'generated/prisma/enums';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly expo = new Expo();

  constructor(private readonly prisma: PrismaService) {}

  async getUserNotifications(userId: number) {
    return await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(userId: number, notificationId: number) {
    return await this.prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId,
      },
      data: { isRead: true },
    });
  }

  async sendPushToUser(
    userId: number,
    title: string,
    body: string,
    data?: any,
    type: NotificationType = NotificationType.SYSTEM,
    referenceId?: number,
  ) {
    if (!userId) return;

    let notification;
    if (referenceId) {
      notification = await this.prisma.notification.findFirst({
        where: { userId, type, referenceId, isRead: false },
      });
    }
    if (notification) {
      notification = await this.prisma.notification.update({
        where: { id: notification.id },
        data: { title, body, data: { ...data, id: notification.id } },
      });
    } else {
      notification = await this.prisma.notification.create({
        data: { userId, type, referenceId, title, body, data: data || {} },
      });
    }

    const deviceTokens = await this.prisma.deviceToken.findMany({
      where: { userId },
    });
    if (!deviceTokens.length) return;

    const mobileTokens = deviceTokens.filter((dt) => dt.device === DeviceType.MOBILE).map((dt) => dt.token);

    if (mobileTokens.length > 0) {
      const collapseKey = referenceId ? `${type}_${referenceId}` : undefined;
      await this.sendExpoNotifications(mobileTokens, title, body, { ...data, id: notification.id }, collapseKey);
    }
  }

  private async sendExpoNotifications(tokens: string[], title: string, body: string, data?: any, collapseId?: string) {
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));
    if (!validTokens.length) return;
    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      threadId: collapseId,
    }));

    const tickets = await this.expo.sendPushNotificationsAsync(messages);
    const deadTokens = tickets
      .map((ticket, i) =>
        ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered' ? validTokens[i] : null,
      )
      .filter((t): t is string => !!t);

    if (deadTokens.length > 0) {
      await this.prisma.deviceToken.deleteMany({ where: { token: { in: deadTokens } } });
    }
  }

  async deleteAllByUserId(userId: number) {
    return await this.prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
