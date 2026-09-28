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
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import {
  CreateProjectDto,
  AddProjectMemberDto,
} from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { CreateTaskDto } from '../tasks/dto/create-task.dto.js';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // Project CRUD
  @Post()
  create(@Body() payload: CreateProjectDto) {
    return this.projectsService.create(payload);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
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
  listProjectMembers(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.projectsService.listProjectMembers(projectId);
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
  getTasks(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.projectsService.getTasks(projectId);
  }
}
