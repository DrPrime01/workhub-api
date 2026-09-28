import { IsIn, IsOptional } from 'class-validator';

export class SortQueryDto {
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
