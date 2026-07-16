import { IsInt, Min } from 'class-validator';

export class AssignAwbDto {
  @IsInt()
  @Min(1)
  courierId!: number;
}
