import { PartialType } from '@nestjs/mapped-types';
import { CreateDirectionDto } from './create-direction.dto';
import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDirectionDto extends PartialType(CreateDirectionDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  imageIdToDelete?: number;
}
