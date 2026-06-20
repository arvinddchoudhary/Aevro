import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';
import { AdminController } from './admin.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminUploadsController } from './admin-uploads.controller';

@Module({
  imports: [AuthModule, PrismaModule, UploadsModule],
  controllers: [AdminController, AdminProductsController, AdminUploadsController],
  providers: [AdminProductsService],
})
export class AdminModule {}
