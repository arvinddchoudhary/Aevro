import { Controller, Get, Inject } from '@nestjs/common';
import { HomepageService } from './homepage.service';

@Controller('homepage')
export class HomepageController {
  constructor(
    @Inject(HomepageService) private readonly homepageService: HomepageService,
  ) {}

  @Get()
  async getHomepage() {
    return this.homepageService.findActiveSections();
  }
}
