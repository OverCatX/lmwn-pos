import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { ReportsController } from '../../presentation/controllers/reports';

// Application
import { ReportsService } from '../../application/reports/services';

// Infrastructure - Order Context (for reports data)
import {
    OrderOrmEntity,
    OrderItemOrmEntity,
    OrderRepository,
} from '../../infrastructure/database/order';

/**
 * Reports Module
 * Handles all reporting and analytics functionality
 */
@Module({
    imports: [TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity])],
    controllers: [ReportsController],
    providers: [
        ReportsService,
        {
            provide: 'IOrderRepository',
            useClass: OrderRepository,
        },
    ],
    exports: [ReportsService],
})
export class ReportsModule { }
