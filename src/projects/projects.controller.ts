import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  ParseEnumPipe,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import {
  CreateProjectDto,
  AddProjectMemberDto,
} from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { CreateTaskDto } from '../tasks/dto/create-task.dto.js';
import { Priority, Status } from '../generated/prisma/enums.js';
import {
  ProjectListQueryDto,
  ProjectMembersListQueryDto,
  TaskListQueryDto,
} from './dto/project-list-query.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Project CRUD
  @Post()
  create(@Body() payload: CreateProjectDto) {
    return this.projectsService.create(payload);
  }

  @Get()
  findAll(
    @Query() { page, limit, sortBy, order, search }: ProjectListQueryDto,
  ) {
    return this.projectsService.findAll(page, limit, sortBy, order, search);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }

  // Project members CRUD

  @Get(':projectId/members')
  listProjectMembers(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() { page, limit, sortBy, order, search }: ProjectMembersListQueryDto,
  ) {
    return this.projectsService.listProjectMembers(
      projectId,
      page,
      limit,
      sortBy,
      order,
      search,
    );
  }

  @Post(':projectId/members')
  addProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() payload: AddProjectMemberDto,
  ) {
    return this.projectsService.addProjectMember(projectId, payload);
  }

  @Delete(':projectId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.projectsService.removeProjectMember(projectId, userId);
  }

  // Tasks CR
  @Post(':projectId/tasks')
  createTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() payload: CreateTaskDto,
  ) {
    return this.projectsService.createTask(projectId, payload);
  }

  @Get(':projectId/tasks')
  getTasks(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() { page, limit, sortBy, order, search }: TaskListQueryDto,
    @Query('status', new ParseEnumPipe(Status, { optional: true }))
    status?: Status,
    @Query('priority', new ParseEnumPipe(Priority, { optional: true }))
    priority?: Priority,
  ) {
    return this.projectsService.getTasks(
      projectId,
      page,
      limit,
      sortBy,
      order,
      search,
      status,
      priority,
    );
  }
}
