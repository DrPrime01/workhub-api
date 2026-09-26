import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsUUID()
  ownerId: string;
}
