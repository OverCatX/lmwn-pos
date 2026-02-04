import { OrderItem } from "src/domain/entities/order-item.entity";
import { Money } from "src/domain/value-objects/money.vo";
import { Quantity } from "src/domain/value-objects/quantity.vo";
import { OrderItemOrmEntity } from "../../entities";
import { OrderItemMapper } from "../order-item.mapper";

describe('OrderItemMapper', () => {
  describe('toDomain', () => {
    it('should convert ORM entity to domain entity', () => {
      const orm = new OrderItemOrmEntity();
      orm.id = 'item1';
      orm.productId = 'p1';
      orm.orderId = 'o1';
      orm.quantity = 2;
      orm.unitPrice = '50.00';
      orm.currency = 'THB';
      orm.discountAmount = '5.00';
      orm.subtotal = '100.00';
      orm.total = '95.00';
      orm.createdAt = new Date();

      const domain = OrderItemMapper.toDomain(orm);

      expect(domain.getId()).toBe('item1');
      expect(domain.getProductId()).toBe('p1');
      expect(domain.getQuantity().toNumber()).toBe(2);
      expect(domain.getUnitPrice().toNumber()).toBe(50);
      expect(domain.getDiscountAmount().toNumber()).toBe(5);
    });

    it('should handle zero discount', () => {
      const orm = new OrderItemOrmEntity();
      orm.id = 'item1';
      orm.productId = 'p1';
      orm.orderId = 'o1';
      orm.quantity = 1;
      orm.unitPrice = '100.00';
      orm.currency = 'THB';
      orm.discountAmount = '0.00';
      orm.subtotal = '100.00';
      orm.total = '100.00';
      orm.createdAt = new Date();

      const domain = OrderItemMapper.toDomain(orm);

      expect(domain.getDiscountAmount().toNumber()).toBe(0);
      expect(domain.calculateTotal().toNumber()).toBe(100);
    });
  });

  describe('toOrm', () => {
    it('should convert domain entity to ORM entity', () => {
      const domain = new OrderItem(
        'item1',
        'p1',
        Quantity.from(3),
        Money.from(40, 'THB'),
        Money.from(10, 'THB'),
      );

      const orm = OrderItemMapper.toOrm(domain, 'o1');

      expect(orm.id).toBe('item1');
      expect(orm.productId).toBe('p1');
      expect(orm.orderId).toBe('o1');
      expect(orm.quantity).toBe(3);
      expect(orm.unitPrice).toBe('40.00');
      expect(orm.currency).toBe('THB');
      expect(orm.discountAmount).toBe('10.00');
      expect(orm.subtotal).toBe('120.00'); // 3 * 40
      expect(orm.total).toBe('110.00'); // 120 - 10
    });

    it('should calculate subtotal and total correctly', () => {
      const domain = new OrderItem(
        'item1',
        'p1',
        Quantity.from(2),
        Money.from(75.50, 'THB'),
      );

      const orm = OrderItemMapper.toOrm(domain, 'o1');

      expect(orm.subtotal).toBe('151.00'); // 2 * 75.50
      expect(orm.total).toBe('151.00'); // No discount
    });
  });

  describe('toDomainList', () => {
    it('should convert array of ORM entities to domain entities', () => {
      const orm1 = new OrderItemOrmEntity();
      orm1.id = 'item1';
      orm1.productId = 'p1';
      orm1.orderId = 'o1';
      orm1.quantity = 1;
      orm1.unitPrice = '10.00';
      orm1.currency = 'THB';
      orm1.discountAmount = '0.00';
      orm1.subtotal = '10.00';
      orm1.total = '10.00';
      orm1.createdAt = new Date();

      const orm2 = new OrderItemOrmEntity();
      orm2.id = 'item2';
      orm2.productId = 'p2';
      orm2.orderId = 'o1';
      orm2.quantity = 2;
      orm2.unitPrice = '20.00';
      orm2.currency = 'THB';
      orm2.discountAmount = '5.00';
      orm2.subtotal = '40.00';
      orm2.total = '35.00';
      orm2.createdAt = new Date();

      const domainList = OrderItemMapper.toDomainList([orm1, orm2]);

      expect(domainList).toHaveLength(2);
      expect(domainList[0].getId()).toBe('item1');
      expect(domainList[1].getId()).toBe('item2');
    });
  });

  describe('toOrmList', () => {
    it('should convert array of domain entities to ORM entities', () => {
      const item1 = new OrderItem(
        'item1',
        'p1',
        Quantity.from(1),
        Money.from(10, 'THB'),
      );

      const item2 = new OrderItem(
        'item2',
        'p2',
        Quantity.from(2),
        Money.from(20, 'THB'),
        Money.from(5, 'THB'),
      );

      const ormList = OrderItemMapper.toOrmList([item1, item2], 'o1');

      expect(ormList).toHaveLength(2);
      expect(ormList[0].id).toBe('item1');
      expect(ormList[0].orderId).toBe('o1');
      expect(ormList[1].id).toBe('item2');
      expect(ormList[1].orderId).toBe('o1');
    });
  });
});
