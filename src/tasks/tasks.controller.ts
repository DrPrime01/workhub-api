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

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(id);
  }

  @Post(':taskId/comments')
  addComment(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() payload: CreateCommentDto,
  ) {
    return this.tasksService.addComment(taskId, payload);
  }

  @Get(':taskId/comments')
  getComments(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() { page, limit, sortBy, order, search }: CommentListQueryDto,
  ) {
    return this.tasksService.getComments(
      taskId,
      page,
      limit,
      sortBy,
      order,
      search,
    );
  }
}
