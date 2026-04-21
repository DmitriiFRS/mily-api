import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/prisma.service';
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from 'src/common/decorators/ws-exception.filter';
import { RoomIdDto } from './dto/room-id.dto';
import { SendMessageDto } from './dto/send-message.dto';

@UseFilters(new WsExceptionFilter())
@UsePipes(new ValidationPipe({ transform: true }))
@WebSocketGateway({ namespace: 'chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      const token = authHeader?.split(' ')[1] || client.handshake.auth?.token;
      if (!token) {
        throw new Error('Токен не передан');
      }
      const payload = this.jwtService.verify(token as string);
      client.data.userId = payload.sub;
      console.log(`Соединение установлено: ${client.id}, User ID: ${payload.sub}`);
    } catch {
      console.log(`Соединение отклонено: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Соединение закрыто: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: RoomIdDto) {
    const { roomId } = payload;
    const userId = client.data.userId;
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { isAdmin: true } } },
    });
    if (!user) {
      throw new WsException('Пользователь не найден');
    }
    const isAdmin = user?.role?.isAdmin ?? false;
    if (!isAdmin) {
      const isParticipant = await this.prisma.chatParticipant.findUnique({
        where: {
          roomId_userId: {
            roomId: roomId,
            userId: userId,
          },
        },
      });
      if (!isParticipant) {
        throw new WsException('Отказано в доступе к комнате');
      }
    }
    const roomName = roomId.toString();
    client.join(roomName);
    await this.prisma.chatParticipant.upsert({
      where: { roomId_userId: { roomId, userId } },
      update: { lastReadAt: new Date() },
      create: { roomId, userId, lastReadAt: new Date() },
    });
    return { event: 'joinedRoom', roomId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: SendMessageDto) {
    const userId = client.data.userId;
    const { roomId, text, fileId } = payload;
    if (!text && !fileId) {
      throw new WsException('Сообщение не может быть пустым');
    }
    if (fileId) {
      const fileExists = await this.prisma.file.findUnique({
        where: { id: fileId },
        select: { id: true },
      });
      if (!fileExists) {
        throw new WsException('Прикрепленный файл не найден');
      }
    }
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!participant) {
      throw new WsException('Вы не участник этой комнаты');
    }
    const savedMessage = await this.prisma.message.create({
      data: {
        text: text || null,
        roomId: roomId,
        senderId: userId,
        fileId: fileId || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatarFileId: true },
        },
        file: true,
      },
    });
    const roomName = roomId.toString();
    this.server.to(roomName).emit('newMessage', savedMessage);
    return { status: 'success', messageId: savedMessage.id };
  }

  @SubscribeMessage('readMessages')
  async handleReadMessages(@ConnectedSocket() client: Socket, @MessageBody() payload: RoomIdDto) {
    const { roomId } = payload;
    const userId = client.data.userId;
    const participant = await this.prisma.chatParticipant.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!participant) {
      throw new WsException('Вы не участник этой комнаты');
    }
    await this.prisma.chatParticipant.update({
      where: { roomId_userId: { roomId, userId } },
      data: { lastReadAt: new Date() },
    });

    client.to(roomId.toString()).emit('userReadMessages', { userId, roomId });
    return { status: 'success' };
  }
}
