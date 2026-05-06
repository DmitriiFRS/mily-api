import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateDirectionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  originCityId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationCityId: number;
}
