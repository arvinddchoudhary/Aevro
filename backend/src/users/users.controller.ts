import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/types/authenticated-request';
import {
  CreateAddressDto,
  UpdateAddressDto,
  UpdateProfileDto,
} from './dto/user-profile.dto';
import { UsersService } from './users.service';

@Controller('users/me')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@Req() request: AuthenticatedRequest) {
    return {
      success: true,
      data: await this.usersService.getProfile(this.getUserId(request)),
    };
  }

  @Patch()
  async updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return {
      success: true,
      data: await this.usersService.updateProfile(this.getUserId(request), dto),
    };
  }

  @Get('addresses')
  async listAddresses(@Req() request: AuthenticatedRequest) {
    return {
      success: true,
      data: await this.usersService.listAddresses(this.getUserId(request)),
    };
  }

  @Post('addresses')
  async createAddress(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateAddressDto,
  ) {
    return {
      success: true,
      data: await this.usersService.createAddress(this.getUserId(request), dto),
    };
  }

  @Patch('addresses/:id')
  async updateAddress(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return {
      success: true,
      data: await this.usersService.updateAddress(this.getUserId(request), id, dto),
    };
  }

  @Patch('addresses/:id/default')
  async setDefaultAddress(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return {
      success: true,
      data: await this.usersService.setDefaultAddress(this.getUserId(request), id),
    };
  }

  @Delete('addresses/:id')
  async deleteAddress(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    await this.usersService.deleteAddress(this.getUserId(request), id);

    return {
      success: true,
      data: {
        id,
      },
    };
  }

  private getUserId(request: AuthenticatedRequest) {
    return request.user!.id;
  }
}
