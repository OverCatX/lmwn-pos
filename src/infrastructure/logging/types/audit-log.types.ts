import { OrderStatus } from '../../../domain/order';
import { DiscountType } from '../../../domain/discount';

/**
 * Audit Log Value Types
 * Type-safe definitions for audit log data
 */

/**
 * Order creation data
 */
export interface OrderCreatedData {
    orderNumber: string;
    status: OrderStatus;
    itemsCount: number;
    total: number;
    subtotal: number;
    tax: number;
}

/**
 * Order status change data
 */
export interface OrderStatusChangedData {
    oldStatus: OrderStatus;
    newStatus: OrderStatus;
    reason?: string;
}

/**
 * Discount applied data
 */
export interface DiscountAppliedData {
    discountType: DiscountType;
    discountValue: number;
    appliedAmount: number;
    maxDiscount?: number;
}

/**
 * Order item added data
 */
export interface OrderItemAddedData {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

/**
 * Order item removed data
 */
export interface OrderItemRemovedData {
    productId: string;
    productName: string;
    quantity: number;
}

/**
 * Discriminated Union for Audit Log Actions
 */
export type AuditLogAction =
    | {
        action: 'created';
        entityType: 'order';
        oldValue: null;
        newValue: OrderCreatedData;
    }
    | {
        action: 'status_changed';
        entityType: 'order';
        oldValue: { status: OrderStatus };
        newValue: OrderStatusChangedData;
    }
    | {
        action: 'discount_applied';
        entityType: 'order';
        oldValue: null;
        newValue: DiscountAppliedData;
    }
    | {
        action: 'item_added';
        entityType: 'order';
        oldValue: null;
        newValue: OrderItemAddedData;
    }
    | {
        action: 'item_removed';
        entityType: 'order';
        oldValue: OrderItemRemovedData;
        newValue: null;
    }
    | {
        action: 'updated';
        entityType: 'order';
        oldValue: Record<string, unknown>;
        newValue: Record<string, unknown>;
    };

/**
 * Type guard to check if action is typed
 */
export function isTypedAuditAction(
    action: string,
): action is AuditLogAction['action'] {
    return [
        'created',
        'status_changed',
        'discount_applied',
        'item_added',
        'item_removed',
        'updated',
    ].includes(action);
}
