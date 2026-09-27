import {
  IsString,
  IsOptional,
  IsUUID,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  ownerId: string;
}

export class AddProjectMemberDto {
  @IsUUID()
  userId: string;
}
