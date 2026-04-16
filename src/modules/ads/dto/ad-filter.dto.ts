import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { AdType } from 'generated/prisma/enums';
import { TransformToUpperCase } from 'src/common/decorators/transform-uppercase.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class AdFilterDto extends PaginationDto {
  @IsOptional()
  @TransformToUpperCase()
  @IsEnum(AdType)
  type?: AdType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  weight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cargoCategoryId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  originCityId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationCityId?: number;
}
