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
import { DiscountOrmEntity } from '../../discount/entities/discount.orm.entity';
import { DiscountType } from '../../../../domain/discount';

/**
 * OrderDiscount ORM Entity
 * Maps applied discounts to order_discounts table
 * Represents many-to-many relationship between Orders and Discounts
 * Stores actual discount application details
 */
@Entity('order_discounts')
export class OrderDiscountOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Index('idx_order_discounts_order_id')
    @Column({ type: 'uuid', name: 'order_id' })
    orderId: string;

    @Index('idx_order_discounts_discount_id')
    @Column({ type: 'uuid', nullable: true, name: 'discount_id' })
    discountId: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true, name: 'discount_code' })
    discountCode: string | null;

    @Column({
        type: 'enum',
        enum: DiscountType,
        name: 'discount_type',
    })
    discountType: DiscountType;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'discount_value' })
    discountValue: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, name: 'applied_amount' })
    appliedAmount: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => OrderOrmEntity, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'order_id' })
    order: OrderOrmEntity;

    @ManyToOne(() => DiscountOrmEntity, {
        onDelete: 'RESTRICT',
        nullable: true,
    })
    @JoinColumn({ name: 'discount_id' })
    discount: DiscountOrmEntity | null;
}
