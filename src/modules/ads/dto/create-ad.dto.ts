import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { AdType } from 'generated/prisma/enums';
import { TransformToUpperCase } from 'src/common/decorators/transform-uppercase.decorator';

export class CreateAdDto {
  @TransformToUpperCase()
  @IsEnum(AdType)
  type: AdType;

  @Type(() => Date)
  @IsDate()
  dateFrom: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  weightKg?: number;

  @IsString()
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  price: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  servicePrice?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  originCityId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationCityId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  cargoCategoryId: number;
}
