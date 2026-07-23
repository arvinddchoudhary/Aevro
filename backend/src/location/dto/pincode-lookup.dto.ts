import { Matches } from 'class-validator';

export class PincodeLookupDto {
  @Matches(/^\d{6}$/)
  postalCode!: string;
}
