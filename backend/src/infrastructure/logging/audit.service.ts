import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AuditLogOrmEntity } from '../database/shared/entities/audit-log.orm.entity';
import { OrderStatus } from '../../domain/order';
import { DiscountType } from '../../domain/discount';
import {
    OrderCreatedData,
    OrderStatusChangedData,
    DiscountAppliedData,
    OrderItemAddedData,
    OrderItemRemovedData,
} from './types/audit-log.types';

/**
 * Audit Service
 * Infrastructure service for logging all changes for traceability
 * Provides quick root cause identification when issues occur
 */
@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLogOrmEntity)
        private readonly auditLogRepository: Repository<AuditLogOrmEntity>,
    ) { }

    /**
     * Generic log method for custom or untyped actions
     * Use typed methods (logOrderCreated, logOrderStatusChange, etc.) when possible
     */
    private async logChange<T = Record<string, unknown>>(
        entityType: string,
        entityId: string,
        action: string,
        oldValue: T | Record<string, unknown> | null,
        newValue: T | Record<string, unknown> | null,
        changedBy: string,
    ): Promise<void> {
        try {
            const auditLog = new AuditLogOrmEntity();
            auditLog.id = randomUUID();
            auditLog.entityType = entityType;
            auditLog.entityId = entityId;
            auditLog.action = action;
            auditLog.oldValue = oldValue as Record<string, unknown> | null;
            auditLog.newValue = newValue as Record<string, unknown> | null;
            auditLog.changedBy = changedBy;

            await this.auditLogRepository.save(auditLog);
        } catch (error) {
            console.error('AuditService error:', error);
        }
    }

    /**
     * Log order status change (Type-safe)
     */
    async logOrderStatusChange(
        orderId: string,
        oldStatus: OrderStatus,
        newStatus: OrderStatus,
        changedBy: string,
        reason?: string,
    ): Promise<void> {
        const data: OrderStatusChangedData = {
            oldStatus,
            newStatus,
            reason,
        };

        await this.logChange(
            'order',
            orderId,
            'status_changed',
            { status: oldStatus },
            data,
            changedBy,
        );
    }

    /**
     * Log discount application (Type-safe)
     */
    async logDiscountApplied(
        orderId: string,
        discountType: DiscountType,
        discountValue: number,
        appliedAmount: number,
        changedBy: string,
        maxDiscount?: number,
    ): Promise<void> {
        const data: DiscountAppliedData = {
            discountType,
            discountValue,
            appliedAmount,
            maxDiscount,
        };

        await this.logChange(
            'order',
            orderId,
            'discount_applied',
            null,
            data,
            changedBy,
        );
    }

    /**
     * Log order creation (Type-safe)
     */
    async logOrderCreated(
        orderId: string,
        orderData: OrderCreatedData,
        createdBy: string,
    ): Promise<void> {
        await this.logChange(
            'order',
            orderId,
            'created',
            null,
            orderData,
            createdBy,
        );
    }

    async logOrderDiscountRemoved(
        orderId: string,
        discountAmount: number,
        changedBy: string,
    ): Promise<void> {
        await this.logChange(
            'order',
            orderId,
            'discount_removed',
            { discountAmount },
            null,
            changedBy,
        );
    }

    /**
     * Log order item added (Type-safe)
     */
    async logOrderItemAdded(
        orderId: string,
        itemData: OrderItemAddedData,
        changedBy: string,
    ): Promise<void> {
        await this.logChange(
            'order',
            orderId,
            'item_added',
            null,
            itemData,
            changedBy,
        );
    }

    /**
     * Log order item removed (Type-safe)
     */
    async logOrderItemRemoved(
        orderId: string,
        itemData: OrderItemRemovedData,
        changedBy: string,
    ): Promise<void> {
        await this.logChange(
            'order',
            orderId,
            'item_removed',
            itemData,
            null,
            changedBy,
        );
    }

    /**
     * Get audit logs for an entity
     * @param entityType - Type of entity
     * @param entityId - ID of the entity
     * @returns Audit logs
     */
    async getAuditLogs(
        entityType: string,
        entityId: string,
    ): Promise<AuditLogOrmEntity[]> {
        return await this.auditLogRepository.find({
            where: {
                entityType,
                entityId,
            },
            order: {
                changedAt: 'DESC',
            },
        });
    }
}
