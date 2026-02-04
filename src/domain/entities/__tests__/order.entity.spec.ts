import { Money } from '../../value-objects/money.vo';
import { OrderNumber } from '../../value-objects/order-number.vo';
import { OrderStatus } from '../../enums/order-status.enum';
import { Product } from '../product.entity';
import { Order } from '../order.entity';
import {
  InvalidOrderStateException,
  InvalidDiscountException,
  OrderItemNotFoundException,
} from '../../exceptions';

describe('Order Entity', () => {
  const createProduct = (id: string, price: number) =>
    new Product(id, `Product ${id}`, Money.from(price), 'FOOD', true);

  it('should create order with generated order number', () => {
    const order = Order.create('o1', 'staff-1', new Date('2024-12-01'));
    expect(order.getOrderNumber().toString()).toMatch(/^ORD-2024-1201-\d{3}$/);
    expect(order.getCreatedBy()).toBe('staff-1');
  });

  it('should add items and recalculate totals', () => {
    const order = Order.create('o1', 'staff-1');

    order.addItem(createProduct('p1', 50), 2); // 100
    order.addItem(createProduct('p2', 25), 1); // 25

    expect(order.getSubtotal().toNumber()).toBe(125);
    expect(order.getTotal().toNumber()).toBe(125);
  });

  it('should remove items and recalculate totals', () => {
    const order = Order.create('o1', 'staff-1');

    order.addItem(createProduct('p1', 50), 2); // item-1
    order.addItem(createProduct('p2', 25), 1); // item-2

    order.removeItem('item-1');

    expect(order.getSubtotal().toNumber()).toBe(25);
  });

  it('should throw OrderItemNotFoundException when removing non-existent item', () => {
    const order = Order.create('o1', 'staff-1');
    order.addItem(createProduct('p1', 50), 2);

    expect(() => order.removeItem('non-existent')).toThrow(
      OrderItemNotFoundException,
    );
  });

  it('should apply discount not greater than subtotal', () => {
    const order = Order.create('o1', 'staff-1');

    order.addItem(createProduct('p1', 100), 1);
    order.applyDiscount(Money.from(10));

    expect(order.getDiscountAmount().toNumber()).toBe(10);
    expect(order.getTotal().toNumber()).toBe(90);
  });

  it('should throw InvalidDiscountException when discount exceeds subtotal', () => {
    const order = Order.create('o1', 'staff-1');
    order.addItem(createProduct('p1', 100), 1);

    expect(() => order.applyDiscount(Money.from(200))).toThrow(
      InvalidDiscountException,
    );
  });

  it('should throw InvalidDiscountException for negative discount', () => {
    const order = Order.create('o1', 'staff-1');
    order.addItem(createProduct('p1', 100), 1);

    expect(() => order.applyDiscount(Money.from(-10))).toThrow(
      InvalidDiscountException,
    );
  });

  describe('State Transitions', () => {
    it('should allow valid state transitions', () => {
      const order = Order.create('o1', 'staff-1');
      order.addItem(createProduct('p1', 100), 1);

      // PENDING → CONFIRMED
      order.updateStatus(OrderStatus.CONFIRMED);
      expect(order.getStatus()).toBe(OrderStatus.CONFIRMED);

      // CONFIRMED → PREPARING
      order.updateStatus(OrderStatus.PREPARING);
      expect(order.getStatus()).toBe(OrderStatus.PREPARING);

      // PREPARING → READY
      order.updateStatus(OrderStatus.READY);
      expect(order.getStatus()).toBe(OrderStatus.READY);

      // READY → COMPLETED
      order.updateStatus(OrderStatus.COMPLETED);
      expect(order.getStatus()).toBe(OrderStatus.COMPLETED);
      expect(order.getCompletedAt()).toBeDefined();
    });

    it('should throw InvalidOrderStateException for invalid transition', () => {
      const order = Order.create('o1', 'staff-1');

      // PENDING → READY (invalid, must go through CONFIRMED and PREPARING)
      expect(() => order.updateStatus(OrderStatus.READY)).toThrow(
        InvalidOrderStateException,
      );
    });

    it('should allow cancellation from any state before completion', () => {
      const order = Order.create('o1', 'staff-1');
      order.addItem(createProduct('p1', 100), 1);

      order.updateStatus(OrderStatus.CONFIRMED);
      order.updateStatus(OrderStatus.CANCELLED);

      expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
    });

    it('should prevent status change after completed', () => {
      const orderNumber = OrderNumber.from('ORD-2024-1201-001');
      const order = new Order('o1', orderNumber, 'staff-1', OrderStatus.READY);
      order.addItem(createProduct('p1', 100), 1);

      order.updateStatus(OrderStatus.COMPLETED);

      expect(() => order.updateStatus(OrderStatus.CANCELLED)).toThrow(
        InvalidOrderStateException,
      );
    });

    it('should prevent modifying completed order', () => {
      const order = Order.create('o1', 'staff-1');
      order.addItem(createProduct('p1', 100), 1);
      order.updateStatus(OrderStatus.CONFIRMED);
      order.updateStatus(OrderStatus.PREPARING);
      order.updateStatus(OrderStatus.READY);
      order.updateStatus(OrderStatus.COMPLETED);

      expect(() => order.addItem(createProduct('p2', 50), 1)).toThrow(
        InvalidOrderStateException,
      );
      expect(() => order.removeItem('item-1')).toThrow(
        InvalidOrderStateException,
      );
      expect(() => order.applyDiscount(Money.from(10))).toThrow(
        InvalidOrderStateException,
      );
    });
  });
});

