import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SendPasswordResetOtpDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;
}

export class VerifyPasswordResetOtpDto extends SendPasswordResetOtpDto {
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  code!: string;
}

export class ResetPasswordDto extends SendPasswordResetOtpDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @MinLength(32)
  @MaxLength(128)
  resetToken!: string;
}
