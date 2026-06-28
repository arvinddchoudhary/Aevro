import { IsString, Matches } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit code.' })
  code!: string;
}
