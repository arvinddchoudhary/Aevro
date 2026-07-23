import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { PincodeLookupDto } from './dto/pincode-lookup.dto';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
  constructor(@Inject(LocationService) private readonly location: LocationService) {}

  @Post('pincode')
  async pincode(@Body() dto: PincodeLookupDto, @Req() request: FastifyRequest) {
    return {
      success: true,
      data: await this.location.lookupPincode(dto.postalCode, request.ip),
    };
  }
}
