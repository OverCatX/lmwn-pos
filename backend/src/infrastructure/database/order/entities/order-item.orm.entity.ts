import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { OrderOrmEntity } from './order.orm.entity';
import { ProductOrmEntity } from '../../product/entities/product.orm.entity';

/**
 * OrderItem ORM Entity
 * Maps OrderItem domain entity to order_items table
 */
@Entity('order_items')
export class OrderItemOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Index('idx_order_items_order_id')
    @Column({ type: 'uuid', name: 'order_id' })
    orderId: string;

    @Index('idx_order_items_product_id')
    @Column({ type: 'uuid', name: 'product_id' })
    productId: string;

    @Column({ type: 'varchar', length: 255, name: 'product_name' })
    productName: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
    unitPrice: string;

    @Column({ type: 'varchar', length: 3, default: 'THB' })
    currency: string;

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

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => OrderOrmEntity, (order) => order.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'order_id' })
    order: OrderOrmEntity;

    @ManyToOne(() => ProductOrmEntity, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'product_id' })
    product: ProductOrmEntity;
}
