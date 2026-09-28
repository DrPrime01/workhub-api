import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto.js';

export class UpdateCommentDto extends PartialType(
  OmitType(CreateCommentDto, ['authorId']),
) {}
