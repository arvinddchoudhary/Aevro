import { IsDateString, IsOptional } from 'class-validator';

export class SchedulePickupDto {
  @IsDateString({ strict: true })
  @IsOptional()
  pickupDate?: string;
}
