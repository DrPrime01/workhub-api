import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Priority, Status } from '../../generated/prisma/enums.js';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;
}
