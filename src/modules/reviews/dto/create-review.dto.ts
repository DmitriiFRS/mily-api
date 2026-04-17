import { Type } from 'class-transformer';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  text: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  receiverId: number;
}
