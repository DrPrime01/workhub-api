import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  name?: string;

  @IsEmail()
  @MaxLength(256)
  email: string;
}
