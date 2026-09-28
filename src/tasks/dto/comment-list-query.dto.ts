import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SortQueryDto } from '../../common/dto/sort-query.dto.js';
import { IsOptional, IsIn } from 'class-validator';
import { SearchQueryDto } from '../../common/dto/search-query.dto.js';

export const COMMENT_SORT_FIELDS = ['createdAt', 'updatedAt'] as const;

export class CommentListQueryDto extends IntersectionType(
  PaginationQueryDto,
  SortQueryDto,
  SearchQueryDto,
) {
  @IsOptional()
  @IsIn(COMMENT_SORT_FIELDS)
  sortBy: (typeof COMMENT_SORT_FIELDS)[number] = 'createdAt';
}
