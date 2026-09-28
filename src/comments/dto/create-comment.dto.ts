import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MaxLength(2000)
  @IsNotEmpty()
  content: string;

  @IsUUID()
  authorId: string;
}
