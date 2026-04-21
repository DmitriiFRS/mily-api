import { IsInt, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsInt({ message: 'roomId должен быть числом' })
  roomId: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsInt()
  fileId?: number;
}
