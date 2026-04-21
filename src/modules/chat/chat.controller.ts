import { Body, Controller, Get, Param, Query, Post, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ChatService } from './chat.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyChats(@GetUser('id') userId: number) {
    return this.chatService.getUserChats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createOrGetRoom(@GetUser('id') userId: number, @Body() dto: CreateChatDto) {
    return this.chatService.getOrCreateRoom([userId, dto.recipientId]);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async getRoomMessages(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) roomId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.chatService.getRoomMessages(roomId, userId, page, limit);
  }
}
