import { CreateAdDto } from './create-ad.dto';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAdDto extends PartialType(CreateAdDto) {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  imgIdsToDelete?: number[];
}
