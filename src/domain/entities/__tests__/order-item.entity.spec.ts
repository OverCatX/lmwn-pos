import { Money } from '../../value-objects/money.vo';
import { Product } from '../product.entity';
import { OrderItem } from '../order-item.entity';
import { InvalidDiscountException } from '../../exceptions';

describe('OrderItem Entity', () => {
  it('should create order item from product', () => {
    const product = new Product('p1', 'Food', Money.from(50), 'FOOD', true);
    const item = OrderItem.fromProduct('i1', product, 2);

    expect(item.getId()).toBe('i1');
    expect(item.getProductId()).toBe('p1');
    expect(item.getQuantity().toNumber()).toBe(2);
    expect(item.getUnitPrice().toNumber()).toBe(50);
  });

  it('should calculate subtotal correctly', () => {
    const product = new Product('p1', 'Food', Money.from(50), 'FOOD', true);
    const item = OrderItem.fromProduct('i1', product, 2);

    const subtotal = item.calculateSubtotal();
    expect(subtotal.toNumber()).toBe(100);
  });

  it('should calculate total with discount', () => {
    const product = new Product('p1', 'Food', Money.from(50), 'FOOD', true);
    const item = OrderItem.fromProduct('i1', product, 2);

    item.setDiscount(Money.from(10));
    const total = item.calculateTotal();
    expect(total.toNumber()).toBe(90);
  });

  it('should throw InvalidDiscountException when discount exceeds subtotal', () => {
    const product = new Product('p1', 'Food', Money.from(50), 'FOOD', true);
    const item = OrderItem.fromProduct('i1', product, 2);

    expect(() => item.setDiscount(Money.from(200))).toThrow(
      InvalidDiscountException,
    );
  });

  it('should throw InvalidDiscountException for negative discount', () => {
    const product = new Product('p1', 'Food', Money.from(50), 'FOOD', true);
    const item = OrderItem.fromProduct('i1', product, 2);

    expect(() => item.setDiscount(Money.from(-10))).toThrow(
      InvalidDiscountException,
    );
  });

  it('should not allow non-positive quantity', () => {
    const product = new Product('p1', 'Food', Money.from(50), 'FOOD', true);

    expect(() => OrderItem.fromProduct('i1', product, 0)).toThrow(
      'Quantity must be greater than zero',
    );
  });

  it('should change quantity', () => {
    const product = new Product('p1', 'Food', Money.from(50), 'FOOD', true);
    const item = OrderItem.fromProduct('i1', product, 2);

    item.changeQuantity(5);
    expect(item.getQuantity().toNumber()).toBe(5);
    expect(item.calculateSubtotal().toNumber()).toBe(250);
  });
});

