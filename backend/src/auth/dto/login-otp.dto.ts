import { IsEmail, IsString, Matches } from 'class-validator';

export class SendLoginOtpDto {
  @IsEmail()
  email!: string;
}

export class VerifyLoginOtpDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'OTP must be a 6-digit code.' })
  code!: string;
}
