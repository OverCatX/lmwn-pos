import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { OrdersController } from '../../presentation/controllers/orders';

// Application
import { OrderService } from '../../application/orders/services';

// Infrastructures
import {
    OrderOrmEntity,
    OrderItemOrmEntity,
    ProductOrmEntity,
} from '../../infrastructure/database/entities';

// Repositories (Infra)
import {
    OrderRepository,
    ProductRepository,
} from '../../infrastructure/database/repositories';

// Domain - Repository Interfaces


/**
 * Orders Module
 * Handles all order-related functionality
 */
@Module({
    imports: [
        // Register ORM entities for this module
        TypeOrmModule.forFeature([
            OrderOrmEntity,
            OrderItemOrmEntity,
            ProductOrmEntity,
        ]),
    ],
    controllers: [OrdersController],
    providers: [
        // Services (Application)
        OrderService,

        // Repositories (Infra)
        {
            provide: 'IOrderRepository',
            useClass: OrderRepository,
        },
        {
            provide: 'IProductRepository',
            useClass: ProductRepository,
        },
    ],
    exports: [OrderService], // Export if other modules need it
})
export class OrdersModule { }
