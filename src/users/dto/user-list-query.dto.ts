import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SortQueryDto } from '../../common/dto/sort-query.dto.js';
import { IsIn, IsOptional } from 'class-validator';
import { SearchQueryDto } from '../../common/dto/search-query.dto.js';

export const USER_SORT_FIELDS = [
  'name',
  'email',
  'createdAt',
  'updatedAt',
] as const;

export class UserListQueryDto extends IntersectionType(
  PaginationQueryDto,
  SortQueryDto,
  SearchQueryDto,
) {
  @IsOptional()
  @IsIn(USER_SORT_FIELDS)
  sortBy: (typeof USER_SORT_FIELDS)[number] = 'createdAt';
}
