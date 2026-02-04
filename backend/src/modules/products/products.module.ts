import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ProductsController } from '../../presentation/controllers/products';

// Application
import { ProductService } from '../../application/products/services';

// Infrastructure
import {
    ProductOrmEntity,
    ProductRepository,
} from '../../infrastructure/database/product';

/**
 * Products Module
 * Handles all product-related functionality
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([ProductOrmEntity]),
    ],
    controllers: [ProductsController],
    providers: [
        ProductService,
        {
            provide: 'IProductRepository',
            useClass: ProductRepository,
        },
    ],
    exports: [ProductService],
})
export class ProductsModule { }
