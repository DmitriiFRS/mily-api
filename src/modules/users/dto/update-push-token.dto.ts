import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from 'generated/prisma/enums';

export class UpdatePushTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(DeviceType)
  @IsNotEmpty()
  device: DeviceType;
}
