import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { OrderItemOrmEntity } from './order-item.orm.entity';
import { OrderStatus } from '../../../../domain/order';

/**
 * Order ORM Entity
 * Maps Order domain entity to orders table
 */
@Entity('orders')
export class OrderOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true, name: 'order_number' })
    orderNumber: string;

    @Index('idx_orders_status')
    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: '0.00',
        name: 'discount_amount',
    })
    discountAmount: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: string;

    @Column({ type: 'varchar', length: 3, default: 'THB' })
    currency: string;

    @Column({ type: 'varchar', length: 100, name: 'created_by' })
    createdBy: string;

    @Index('idx_orders_created_at')
    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
    completedAt: Date | null;

    @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
    deletedAt: Date | null;

    @OneToMany(() => OrderItemOrmEntity, (orderItem) => orderItem.order, {
        cascade: true,
        // Remove eager: true to avoid N+1 problem
        // Use: repository.find({ relations: ['items'] }) when needed
    })
    items: OrderItemOrmEntity[];
}
