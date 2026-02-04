import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
} from 'typeorm';

/**
 * Product ORM Entity
 * Maps Product domain entity to products table
 */
@Entity('products')
export class ProductOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: string;

    @Column({ type: 'varchar', length: 3, default: 'THB' })
    currency: string;

    @Index('idx_products_category')
    @Column({ type: 'varchar', length: 100 })
    category: string;

    @Index('idx_products_is_active')
    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at', nullable: true })
    deletedAt: Date | null;
}
