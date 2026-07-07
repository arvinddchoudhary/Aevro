import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AuthRateLimitGuard } from './auth/guards/auth-rate-limit.guard';
import { CategoriesModule } from './categories/categories.module';
import { OriginProtectionGuard } from './common/guards/origin-protection.guard';
import { validateEnvironment } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { HomepageModule } from './homepage/homepage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { UsersApiModule } from './users/users-api.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    HealthModule,
    HomepageModule,
    UsersModule,
    UsersApiModule,
    AuthModule,
    NotificationsModule,
    AdminModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: OriginProtectionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthRateLimitGuard,
    },
  ],
})
export class AppModule {}
