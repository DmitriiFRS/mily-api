import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // @IsString()
  // @IsOptional()
  // phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
