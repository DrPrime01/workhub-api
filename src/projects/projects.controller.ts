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
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import {
  CreateProjectDto,
  AddProjectMemberDto,
} from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { CreateTaskDto } from '../tasks/dto/create-task.dto.js';
import { Priority, ProjectRole, Status } from '../generated/prisma/enums.js';
import {
  ProjectListQueryDto,
  ProjectMembersListQueryDto,
  TaskListQueryDto,
} from './dto/project-list-query.dto.js';
import { ProjectRolesGuard } from '../common/guards/project-roles/project-roles.guard.js';
import { ProjectRoles } from '../common/decorators/project-roles/project-roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user/current-user.decorator.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Project CRUD
  @Post()
  create(@CurrentUser() user: UserEntity, @Body() payload: CreateProjectDto) {
    return this.projectsService.create(user.id, payload);
  }

  @Get()
  findAll(
    @CurrentUser() user: UserEntity,
    @Query() { page, limit, sortBy, order, search }: ProjectListQueryDto,
  ) {
    return this.projectsService.findAll(
      user.id,
      page,
      limit,
      sortBy,
      order,
      search,
    );
  }

  @ProjectRoles([ProjectRole.OWNER, ProjectRole.MEMBER])
  @UseGuards(ProjectRolesGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id);
  }

  @ProjectRoles([ProjectRole.OWNER])
  @UseGuards(ProjectRolesGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @ProjectRoles([ProjectRole.OWNER])
  @UseGuards(ProjectRolesGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.remove(id);
  }

  // Project members CRUD

  @ProjectRoles([ProjectRole.OWNER, ProjectRole.MEMBER])
  @UseGuards(ProjectRolesGuard)
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

  @ProjectRoles([ProjectRole.OWNER])
  @UseGuards(ProjectRolesGuard)
  @Post(':projectId/members')
  addProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() payload: AddProjectMemberDto,
  ) {
    return this.projectsService.addProjectMember(projectId, payload);
  }

  @ProjectRoles([ProjectRole.OWNER])
  @UseGuards(ProjectRolesGuard)
  @Delete(':projectId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeProjectMember(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.projectsService.removeProjectMember(projectId, userId);
  }

  // Tasks CR
  @ProjectRoles([ProjectRole.OWNER, ProjectRole.MEMBER])
  @UseGuards(ProjectRolesGuard)
  @Post(':projectId/tasks')
  createTask(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() payload: CreateTaskDto,
  ) {
    return this.projectsService.createTask(projectId, payload);
  }

  @ProjectRoles([ProjectRole.OWNER, ProjectRole.MEMBER])
  @UseGuards(ProjectRolesGuard)
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
