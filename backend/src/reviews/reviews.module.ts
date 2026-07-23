import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadsModule } from '../uploads/uploads.module';
import { AdminReviewsController, CustomerReviewsController, PublicReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [AuthModule, PrismaModule, UploadsModule],
  controllers: [PublicReviewsController, CustomerReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
