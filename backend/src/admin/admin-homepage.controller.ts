import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HomepageService } from '../homepage/homepage.service';
import {
  CreateHomepageSectionDto,
  UpdateHomepageSectionDto,
  UpdateHomepageSectionStatusDto,
} from '../homepage/dto/homepage-section.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminHomepageController {
  constructor(
    @Inject(HomepageService)
    private readonly homepageService: HomepageService,
  ) {}

  @Get('homepage-sections')
  async listSections() {
    return this.homepageService.findAllSections();
  }

  @Post('homepage-sections')
  async createSection(@Body() dto: CreateHomepageSectionDto) {
    return this.homepageService.createSection(dto);
  }

  @Patch('homepage-sections/:id')
  async updateSection(
    @Param('id') id: string,
    @Body() dto: UpdateHomepageSectionDto,
  ) {
    return this.homepageService.updateSection(id, dto);
  }

  @Patch('homepage-sections/:id/status')
  async updateSectionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateHomepageSectionStatusDto,
  ) {
    return this.homepageService.updateSectionStatus(id, dto);
  }

  @Delete('homepage-sections/:id')
  async deleteSection(@Param('id') id: string) {
    return this.homepageService.deleteSection(id);
  }
}
