import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service.js';
import { UpdateCommentDto } from './dto/update-comment.dto.js';
import { CurrentUser } from '../common/decorators/current-user/current-user.decorator.js';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateCommentDto,
  ) {
    return this.commentsService.update(user.id, id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commentsService.remove(user.id, id);
  }
}
