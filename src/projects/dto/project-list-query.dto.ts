import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { SortQueryDto } from '../../common/dto/sort-query.dto.js';
import { IsIn, IsOptional } from 'class-validator';

export const PROJECT_SORT_FIELDS = ['name', 'createdAt', 'updatedAt'] as const;
export const PROJECT_MEMBERS_SORT_FIELDS = [
  'createdAt',
  'name',
  'email',
] as const;
export const TASK_SORT_FIELDS = [
  'title',
  'status',
  'priority',
  'dueDate',
  'createdAt',
  'updatedAt',
] as const;

export class ProjectListQueryDto extends IntersectionType(
  PaginationQueryDto,
  SortQueryDto,
) {
  @IsOptional()
  @IsIn(PROJECT_SORT_FIELDS)
  sortBy: (typeof PROJECT_SORT_FIELDS)[number] = 'createdAt';
}
export class ProjectMembersListQueryDto extends IntersectionType(
  PaginationQueryDto,
  SortQueryDto,
) {
  @IsOptional()
  @IsIn(PROJECT_MEMBERS_SORT_FIELDS)
  sortBy: (typeof PROJECT_MEMBERS_SORT_FIELDS)[number] = 'createdAt';
}

export class TaskListQueryDto extends IntersectionType(
  PaginationQueryDto,
  SortQueryDto,
) {
  @IsOptional()
  @IsIn(TASK_SORT_FIELDS)
  sortBy: (typeof TASK_SORT_FIELDS)[number] = 'createdAt';
}
