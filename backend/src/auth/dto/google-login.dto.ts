import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export const GOOGLE_ID_TOKEN_MAX_LENGTH = 8_192;

export class GoogleLoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(GOOGLE_ID_TOKEN_MAX_LENGTH)
  idToken!: string;
}
