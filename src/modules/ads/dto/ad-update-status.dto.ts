import { AdStatus } from 'generated/prisma/enums';
import { IsEnum } from 'class-validator';
import { TransformToUpperCase } from 'src/common/decorators/transform-uppercase.decorator';

export class AdUpdateStatusDto {
  @TransformToUpperCase()
  @IsEnum(AdStatus)
  status: AdStatus;
}
