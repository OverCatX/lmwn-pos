import { OrderItem } from '../../../../domain/order';
import { Money } from '../../../../domain/shared';
import { Quantity } from '../../../../domain/shared';
import { OrderItemOrmEntity } from '../entities/order-item.orm.entity';

/**
 * OrderItem Mapper
 * Converts between OrderItem domain entity and OrderItemOrmEntity
 */
export class OrderItemMapper {
    /**
     * Convert ORM entity to domain entity
     * @param orm - OrderItem ORM entity
     * @returns OrderItem domain entity
     */
    static toDomain(orm: OrderItemOrmEntity): OrderItem {
        const quantity = Quantity.from(orm.quantity);
        const unitPrice = Money.from(orm.unitPrice, orm.currency);
        const discountAmount = Money.from(orm.discountAmount, orm.currency);

        return new OrderItem(
            orm.id,
            orm.productId,
            orm.productName,
            quantity,
            unitPrice,
            discountAmount,
        );
    }

    /**
     * Convert domain entity to ORM entity
     * @param domain - OrderItem domain entity
     * @param orderId - Parent order ID (required for FK)
     * @returns OrderItem ORM entity
     */
    static toOrm(domain: OrderItem, orderId: string): OrderItemOrmEntity {
        const orm = new OrderItemOrmEntity();

        orm.id = domain.getId();
        orm.orderId = orderId;
        orm.productId = domain.getProductId();
        orm.productName = domain.getProductName();
        orm.quantity = domain.getQuantity().toNumber();
        orm.unitPrice = domain.getUnitPrice().toNumber().toFixed(2);
        orm.currency = domain.getUnitPrice().getCurrency();
        orm.discountAmount = domain.getDiscountAmount().toNumber().toFixed(2);

        // Calculate and set subtotal and total
        orm.subtotal = domain.calculateSubtotal().toNumber().toFixed(2);
        orm.total = domain.calculateTotal().toNumber().toFixed(2);

        return orm;
    }

    /**
     * Convert array of ORM entities to domain entities
     * @param ormList - Array of OrderItem ORM entities
     * @returns Array of OrderItem domain entities
     */
    static toDomainList(ormList: OrderItemOrmEntity[]): OrderItem[] {
        return ormList.map((orm) => this.toDomain(orm));
    }

    /**
     * Convert array of domain entities to ORM entities
     * @param domainList - Array of OrderItem domain entities
     * @param orderId - Parent order ID
     * @returns Array of OrderItem ORM entities
     */
    static toOrmList(domainList: OrderItem[], orderId: string): OrderItemOrmEntity[] {
        return domainList.map((domain) => this.toOrm(domain, orderId));
    }
}
