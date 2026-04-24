import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;

  @IsString()
  @MinLength(9, { message: 'Номер телефона должен быть не менее 9 символов' })
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @MinLength(2, { message: 'Имя должно быть не менее 2 символов' })
  name: string;
}
