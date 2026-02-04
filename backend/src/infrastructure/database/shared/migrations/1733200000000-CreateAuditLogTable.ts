import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAuditLogTable1733200000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'audit_logs',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                    },
                    {
                        name: 'entity_type',
                        type: 'varchar',
                        length: '50',
                    },
                    {
                        name: 'entity_id',
                        type: 'uuid',
                    },
                    {
                        name: 'action',
                        type: 'varchar',
                        length: '50',
                    },
                    {
                        name: 'old_value',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'new_value',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'changed_by',
                        type: 'varchar',
                        length: '100',
                    },
                    {
                        name: 'changed_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        // Create indexes for efficient querying
        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'idx_audit_logs_entity_type',
                columnNames: ['entity_type'],
            }),
        );

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'idx_audit_logs_entity_id',
                columnNames: ['entity_id'],
            }),
        );

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'idx_audit_logs_action',
                columnNames: ['action'],
            }),
        );

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'idx_audit_logs_changed_by',
                columnNames: ['changed_by'],
            }),
        );

        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'idx_audit_logs_changed_at',
                columnNames: ['changed_at'],
            }),
        );

        // Composite index for common query pattern (entity_type + entity_id)
        await queryRunner.createIndex(
            'audit_logs',
            new TableIndex({
                name: 'idx_audit_logs_entity',
                columnNames: ['entity_type', 'entity_id'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_entity');
        await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_changed_at');
        await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_changed_by');
        await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_action');
        await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_entity_id');
        await queryRunner.dropIndex('audit_logs', 'idx_audit_logs_entity_type');
        await queryRunner.dropTable('audit_logs');
    }
}
