import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty({ message: 'ID получателя обязателен' })
  @IsInt({ message: 'ID получателя должен быть числом' })
  recipientId: number;
}
