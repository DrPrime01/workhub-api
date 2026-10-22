import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { CommentListQueryDto } from './dto/comment-list-query.dto.js';
import { CreateCommentDto } from '../comments/dto/create-comment.dto.js';
import { CurrentUser } from '../common/decorators/current-user/current-user.decorator.js';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':id')
  findOne(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tasksService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateTaskDto,
  ) {
    return this.tasksService.update(user.id, id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.tasksService.remove(user.id, id);
  }

  @Post(':taskId/comments')
  addComment(
    @CurrentUser() user: UserEntity,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() payload: CreateCommentDto,
  ) {
    return this.tasksService.addComment(taskId, user.id, payload);
  }

  @Get(':taskId/comments')
  getComments(
    @CurrentUser() user: UserEntity,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() { page, limit, sortBy, order, search }: CommentListQueryDto,
  ) {
    return this.tasksService.getComments(
      user.id,
      taskId,
      page,
      limit,
      sortBy,
      order,
      search,
    );
  }
}
