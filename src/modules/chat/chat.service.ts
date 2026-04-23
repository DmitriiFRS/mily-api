import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateRoom(userIds: number[]) {
    const [userId1, userId2] = userIds;
    const existingRoom = await this.prisma.chatRoom.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: userId1 } } },
          { participants: { some: { userId: userId2 } } },
          {
            participants: {
              every: {
                OR: [{ userId: { in: userIds } }, { user: { role: { isAdmin: true } } }],
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatarFileId: true } } },
        },
      },
    });
    if (existingRoom) {
      return existingRoom;
    }
    return this.prisma.chatRoom.create({
      data: {
        participants: {
          create: userIds.map((id) => ({
            userId: id,
            lastReadAt: new Date(),
          })),
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatarFileId: true } } },
        },
      },
    });
  }

  async getUserChats(userId: number) {
    const participants = await this.prisma.chatParticipant.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { file: { select: { mimeType: true } } },
            },
            participants: {
              where: { userId: { not: userId } },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    lastName: true,
                    avatarFile: {
                      select: {
                        path: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const chats = await Promise.all(
      participants.map(async (p) => {
        const unreadCount = await this.prisma.message.count({
          where: {
            roomId: p.roomId,
            senderId: { not: userId },
            createdAt: { gt: p.lastReadAt },
          },
        });

        const interlocutorParticipant = p.room.participants[0];
        const interlocutor = interlocutorParticipant?.user || null;
        const lastMessage = p.room.messages[0] || null;
        let isMessageRead = false;
        if (lastMessage) {
          if (lastMessage.senderId === userId) {
            if (interlocutorParticipant && interlocutorParticipant.lastReadAt >= lastMessage.createdAt) {
              isMessageRead = true;
            }
          } else {
            if (p.lastReadAt >= lastMessage.createdAt) {
              isMessageRead = true;
            }
          }
        }

        return {
          roomId: p.roomId,
          unreadCount,
          interlocutor,
          lastMessage: lastMessage ? { ...lastMessage, isRead: isMessageRead } : null,
        };
      }),
    );
    return chats.sort((a, b) => {
      const dateA = a.lastMessage?.createdAt.getTime() || 0;
      const dateB = b.lastMessage?.createdAt.getTime() || 0;
      return dateB - dateA;
    });
  }

  async getRoomMessages(roomId: number, userId: number, page: number, limit: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { isAdmin: true } } },
    });
    const isAdmin = user?.role?.isAdmin ?? false;
    if (!isAdmin) {
      const isParticipant = await this.prisma.chatParticipant.findUnique({
        where: { roomId_userId: { roomId, userId } },
      });
      if (!isParticipant) {
        throw new ForbiddenException('Вы не являетесь участником этого чата');
      }
    }
    const skip = (page - 1) * limit;
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, name: true, avatarFileId: true } },
        file: true,
      },
    });
  }
}
