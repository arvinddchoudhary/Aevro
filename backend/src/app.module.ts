import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './categories/categories.module';
import { validateEnvironment } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    HealthModule,
    CategoriesModule,
    ProductsModule,
  ],
})
export class AppModule {}
