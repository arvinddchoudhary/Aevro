import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductSearchIndexService } from './search/product-search-index.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  exports: [ProductSearchIndexService],
  providers: [ProductsService, ProductSearchIndexService],
})
export class ProductsModule {}
