import { Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    let errorMessage = 'Внутренняя ошибка сервера';

    if (exception instanceof WsException) {
      errorMessage = exception.message;
    } else if (exception instanceof HttpException) {
      const response = exception.getResponse();
      errorMessage = typeof response === 'string' ? response : (response as any).message || exception.message;
    }

    client.emit('error', { status: 'error', message: errorMessage });
  }
}
