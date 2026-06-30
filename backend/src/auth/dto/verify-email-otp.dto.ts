import { IsEmail, IsString, Matches } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit code.' })
  code!: string;
}
