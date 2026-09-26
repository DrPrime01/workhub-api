import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export enum Status {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(Status)
  status: Status;

  @IsEnum(Priority)
  priority: Priority;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  assigneeId: string;

  @IsOptional()
  @IsDateString()
  dueDate: string;
}
