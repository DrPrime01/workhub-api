import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterAuthDto {
  @IsString()
  @MaxLength(256)
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsEmail()
  @MaxLength(256)
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
