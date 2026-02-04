import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDiscountTables1733100000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create discounts table
        await queryRunner.createTable(
            new Table({
                name: 'discounts',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'code',
                        type: 'varchar',
                        length: '50',
                        isUnique: true,
                    },
                    {
                        name: 'type',
                        type: 'enum',
                        enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
                    },
                    {
                        name: 'value',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'min_purchase',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'max_discount',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'is_active',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'valid_from',
                        type: 'timestamp',
                    },
                    {
                        name: 'valid_until',
                        type: 'timestamp',
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

        // Create index on code
        await queryRunner.createIndex(
            'discounts',
            new TableIndex({
                name: 'idx_discounts_code',
                columnNames: ['code'],
                isUnique: true,
            }),
        );

        // Create order_discounts table
        await queryRunner.createTable(
            new Table({
                name: 'order_discounts',
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
                        name: 'discount_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'discount_code',
                        type: 'varchar',
                        length: '50',
                        isNullable: true,
                    },
                    {
                        name: 'discount_type',
                        type: 'enum',
                        enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
                    },
                    {
                        name: 'discount_value',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: 'applied_amount',
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

        // Create indexes
        await queryRunner.createIndex(
            'order_discounts',
            new TableIndex({
                name: 'idx_order_discounts_order_id',
                columnNames: ['order_id'],
            }),
        );

        await queryRunner.createIndex(
            'order_discounts',
            new TableIndex({
                name: 'idx_order_discounts_discount_id',
                columnNames: ['discount_id'],
            }),
        );

        // Create foreign keys
        await queryRunner.createForeignKey(
            'order_discounts',
            new TableForeignKey({
                name: 'fk_order_discounts_order',
                columnNames: ['order_id'],
                referencedTableName: 'orders',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'order_discounts',
            new TableForeignKey({
                name: 'fk_order_discounts_discount',
                columnNames: ['discount_id'],
                referencedTableName: 'discounts',
                referencedColumnNames: ['id'],
                onDelete: 'RESTRICT',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        await queryRunner.dropForeignKey('order_discounts', 'fk_order_discounts_discount');
        await queryRunner.dropForeignKey('order_discounts', 'fk_order_discounts_order');

        // Drop indexes
        await queryRunner.dropIndex('order_discounts', 'idx_order_discounts_discount_id');
        await queryRunner.dropIndex('order_discounts', 'idx_order_discounts_order_id');
        await queryRunner.dropIndex('discounts', 'idx_discounts_code');

        // Drop tables
        await queryRunner.dropTable('order_discounts');
        await queryRunner.dropTable('discounts');
    }
}
