import { Order } from '../../../../domain/order';
import { Money } from '../../../../domain/shared';
import { OrderNumber } from '../../../../domain/order';
import { OrderOrmEntity } from '../entities/order.orm.entity';
import { OrderItemMapper } from './order-item.mapper';

/**
 * Order Mapper
 * Converts between Order domain entity and OrderOrmEntity
 * Handles complex nested mapping with OrderItems
 */
export class OrderMapper {
    /**
     * Convert ORM entity to domain entity
     * @param orm - Order ORM entity
     * @returns Order domain entity
     */
    static toDomain(orm: OrderOrmEntity): Order {
        const orderNumber = OrderNumber.from(orm.orderNumber);

        // Map items if they exist
        const items = orm.items && orm.items.length > 0
            ? OrderItemMapper.toDomainList(orm.items)
            : [];

        // Restore order from database with all stored values
        const subtotal = Money.from(parseFloat(orm.subtotal), orm.currency);
        const tax = Money.from(parseFloat(orm.tax || '0'), orm.currency);
        const discountAmount = Money.from(parseFloat(orm.discountAmount), orm.currency);
        const total = Money.from(parseFloat(orm.total), orm.currency);

        const order = Order.restore(
            orm.id,
            orderNumber,
            orm.createdBy,
            orm.status,
            items,
            subtotal,
            tax,
            discountAmount,
            orm.discountAppliedAt || undefined,
            total,
            orm.createdAt,
            orm.updatedAt,
            orm.completedAt || undefined,
        );

        return order;
    }

    /**
     * Convert domain entity to ORM entity
     * @param domain - Order domain entity
     * @returns Order ORM entity
     */
    static toOrm(domain: Order): OrderOrmEntity {
        const orm = new OrderOrmEntity();

        orm.id = domain.getId();
        orm.orderNumber = domain.getOrderNumber().toString();
        orm.status = domain.getStatus();
        orm.subtotal = domain.getSubtotal().toNumber().toFixed(2);
        orm.tax = domain.getTax().toNumber().toFixed(2);
        orm.discountAmount = domain.getDiscountAmount().toNumber().toFixed(2);
        orm.discountAppliedAt = domain.getDiscountAppliedAt() || null;
        orm.total = domain.getTotal().toNumber().toFixed(2);
        orm.currency = domain.getSubtotal().getCurrency();
        orm.createdBy = domain.getCreatedBy();
        orm.createdAt = domain.getCreatedAt();
        orm.updatedAt = domain.getUpdatedAt();
        orm.completedAt = domain.getCompletedAt() || null;

        // Map items
        const items = domain.getItems();
        if (items.length > 0) {
            orm.items = OrderItemMapper.toOrmList(items, domain.getId());
        }

        return orm;
    }

    /**
     * Convert domain entity to partial ORM entity (for updates)
     * @param domain - Order domain entity
     * @returns Partial Order ORM entity
     */
    static toOrmPartial(domain: Order): Partial<OrderOrmEntity> {
        const partial: Partial<OrderOrmEntity> = {
            status: domain.getStatus(),
            subtotal: domain.getSubtotal().toNumber().toFixed(2),
            discountAmount: domain.getDiscountAmount().toNumber().toFixed(2),
            total: domain.getTotal().toNumber().toFixed(2),
            currency: domain.getSubtotal().getCurrency(),
            updatedAt: domain.getUpdatedAt(),
        };

        // Add completedAt if order is completed
        const completedAt = domain.getCompletedAt();
        if (completedAt) {
            partial.completedAt = completedAt;
        }

        return partial;
    }

    /**
     * Convert array of ORM entities to domain entities
     * @param ormList - Array of Order ORM entities
     * @returns Array of Order domain entities
     */
    static toDomainList(ormList: OrderOrmEntity[]): Order[] {
        return ormList.map((orm) => this.toDomain(orm));
    }
}
