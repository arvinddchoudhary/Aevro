import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HomepageModule } from '../homepage/homepage.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';
import { AdminController } from './admin.controller';
import { AdminHomepageController } from './admin-homepage.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminUploadsController } from './admin-uploads.controller';

@Module({
  imports: [AuthModule, PrismaModule, UploadsModule, HomepageModule],
  controllers: [
    AdminController,
    AdminHomepageController,
    AdminOrdersController,
    AdminProductsController,
    AdminUploadsController,
  ],
  providers: [AdminOrdersService, AdminProductsService],
})
export class AdminModule {}
