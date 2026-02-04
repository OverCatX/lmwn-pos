import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { DiscountType } from '../../../../domain/discount';

/**
 * Discount ORM Entity
 * Maps Discount domain entity to discounts table
 * Stores discount rules and configurations
 */
@Entity('discounts')
export class DiscountOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Index('idx_discounts_code', { unique: true })
    @Column({ type: 'varchar', length: 50, unique: true })
    code: string;

    @Column({
        type: 'enum',
        enum: DiscountType,
    })
    type: DiscountType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    value: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'min_purchase',
    })
    minPurchase: string | null;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'max_discount',
    })
    maxDiscount: string | null;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @Column({ type: 'timestamp', name: 'valid_from' })
    validFrom: Date;

    @Column({ type: 'timestamp', name: 'valid_until' })
    validUntil: Date;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @Column({
        type: 'timestamp',
        nullable: true,
        name: 'deleted_at',
        select: false,
    })
    deletedAt: Date | null;
}
