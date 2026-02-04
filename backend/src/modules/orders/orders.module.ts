import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { OrdersController } from '../../presentation/controllers/orders';

// Application
import { OrderService } from '../../application/orders/services';

// Infrastructures - Order Context
import {
    OrderOrmEntity,
    OrderItemOrmEntity,
    OrderRepository,
} from '../../infrastructure/database/order';

// Infrastructures - Product Context
import {
    ProductOrmEntity,
    ProductRepository,
} from '../../infrastructure/database/product';

// Infrastructures - Shared (Audit)
import { AuditLogOrmEntity } from '../../infrastructure/database/shared/entities/audit-log.orm.entity';
import { AuditService } from '../../infrastructure/logging';

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
            AuditLogOrmEntity,
        ]),
    ],
    controllers: [OrdersController],
    providers: [
        // Services (Application)
        OrderService,

        // Services (Infrastructure)
        AuditService,

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
