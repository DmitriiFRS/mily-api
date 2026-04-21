import { IsInt } from 'class-validator';

export class RoomIdDto {
  @IsInt({ message: 'roomId должен быть числом' })
  roomId: number;
}
