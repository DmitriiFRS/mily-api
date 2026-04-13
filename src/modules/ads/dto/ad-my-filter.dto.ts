import { IsEnum, IsOptional } from 'class-validator';
import { AdStatus, AdType } from 'generated/prisma/client';
import { TransformToUpperCase } from 'src/common/decorators/transform-uppercase.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class AdMyFilterDto extends PaginationDto {
  @TransformToUpperCase()
  @IsEnum(AdType)
  cargoType: AdType;

  @IsOptional()
  @TransformToUpperCase()
  @IsEnum(AdStatus)
  cargoStatus?: AdStatus;
}
