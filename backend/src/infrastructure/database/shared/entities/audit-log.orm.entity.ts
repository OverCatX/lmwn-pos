import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';

/**
 * AuditLog ORM Entity
 * Maps to audit_logs table
 * Stores all changes for traceability and debugging
 */
@Entity('audit_logs')
export class AuditLogOrmEntity {
    @PrimaryColumn('uuid')
    id: string;

    @Index('idx_audit_logs_entity_type')
    @Column({ type: 'varchar', length: 50, name: 'entity_type' })
    entityType: string;

    @Index('idx_audit_logs_entity_id')
    @Column({ type: 'uuid', name: 'entity_id' })
    entityId: string;

    @Index('idx_audit_logs_action')
    @Column({ type: 'varchar', length: 50 })
    action: string;

    @Column({ type: 'jsonb', nullable: true, name: 'old_value' })
    oldValue: Record<string, unknown> | null;

    @Column({ type: 'jsonb', nullable: true, name: 'new_value' })
    newValue: Record<string, unknown> | null;

    @Index('idx_audit_logs_changed_by')
    @Column({ type: 'varchar', length: 100, name: 'changed_by' })
    changedBy: string;

    @CreateDateColumn({ type: 'timestamp', name: 'changed_at' })
    @Index('idx_audit_logs_changed_at')
    changedAt: Date;
}
