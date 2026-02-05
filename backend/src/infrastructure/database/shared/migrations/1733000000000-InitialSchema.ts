import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1733000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create products table
        await queryRunner.createTable(
            new Table({
                name: 'products',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'price',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        length: '3',
                        default: "'THB'",
                    },
                    {
                        name: 'category',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create orders table
        await queryRunner.createTable(
            new Table({
                name: 'orders',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'order_number',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: [
                            'PENDING',
                            'CONFIRMED',
                            'PREPARING',
                            'READY',
                            'COMPLETED',
                            'CANCELLED',
                        ],
                        default: "'PENDING'",
                    },
                    {
                        name: 'subtotal',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'tax',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: '0.00',
                    },
                    {
                        name: 'discount_amount',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: '0.00',
                    },
                    {
                        name: 'discount_applied_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'total',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        length: '3',
                        default: "'THB'",
                    },
                    {
                        name: 'created_by',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'completed_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'deleted_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create order_items table
        await queryRunner.createTable(
            new Table({
                name: 'order_items',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'order_id',
                        type: 'uuid',
                    },
                    {
                        name: 'product_id',
                        type: 'uuid',
                    },
                    {
                        name: 'product_name',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'quantity',
                        type: 'int',
                    },
                    {
                        name: 'unit_price',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        length: '3',
                        default: "'THB'",
                    },
                    {
                        name: 'subtotal',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'discount_amount',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: '0.00',
                    },
                    {
                        name: 'total',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Add foreign key: order_items.order_id -> orders.id
        await queryRunner.createForeignKey(
            'order_items',
            new TableForeignKey({
                name: 'fk_order_items_order',
                columnNames: ['order_id'],
                referencedTableName: 'orders',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        // Add foreign key: order_items.product_id -> products.id
        await queryRunner.createForeignKey(
            'order_items',
            new TableForeignKey({
                name: 'fk_order_items_product',
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );

        // Create indexes for better query performance
        await queryRunner.query(
            `CREATE INDEX idx_orders_status ON orders(status)`,
        );
        await queryRunner.query(
            `CREATE INDEX idx_orders_created_at ON orders(created_at)`,
        );
        await queryRunner.query(
            `CREATE INDEX idx_order_items_order_id ON order_items(order_id)`,
        );
        await queryRunner.query(
            `CREATE INDEX idx_order_items_product_id ON order_items(product_id)`,
        );
        await queryRunner.query(
            `CREATE INDEX idx_products_category ON products(category)`,
        );
        await queryRunner.query(
            `CREATE INDEX idx_products_is_active ON products(is_active)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        await queryRunner.dropForeignKey('order_items', 'fk_order_items_product');
        await queryRunner.dropForeignKey('order_items', 'fk_order_items_order');

        // Drop tables
        await queryRunner.dropTable('order_items');
        await queryRunner.dropTable('orders');
        await queryRunner.dropTable('products');
    }
}
