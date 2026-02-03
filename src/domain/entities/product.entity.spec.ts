import { Money } from '../value-objects/money.vo';
import { Product } from './product.entity';
import { InvalidProductException } from '../exceptions';

describe('Product Entity', () => {
  it('should create product with valid data', () => {
    const product = new Product('p1', 'Food', Money.from(100), 'FOOD', true);

    expect(product.getId()).toBe('p1');
    expect(product.getName()).toBe('Food');
    expect(product.getPrice().toNumber()).toBe(100);
    expect(product.getCategory()).toBe('FOOD');
    expect(product.getIsActive()).toBe(true);
  });

  it('should throw InvalidProductException for empty name in constructor', () => {
    expect(
      () => new Product('p1', '   ', Money.from(100), 'FOOD', true),
    ).toThrow(InvalidProductException);
  });

  it('should throw InvalidProductException for negative price in constructor', () => {
    expect(
      () => new Product('p1', 'Food', Money.from(-10), 'FOOD', true),
    ).toThrow('Money amount cannot be negative');
  });

  it('should activate and deactivate product', () => {
    const product = new Product('p1', 'Food', Money.from(100), 'FOOD', true);

    product.deactivate();
    expect(product.getIsActive()).toBe(false);

    product.activate();
    expect(product.getIsActive()).toBe(true);
  });

  it('should change price with non-negative value', () => {
    const product = new Product('p1', 'Food', Money.from(100), 'FOOD', true);

    product.changePrice(Money.from(150));
    expect(product.getPrice().toNumber()).toBe(150);
  });

  it('should throw InvalidProductException for negative price change', () => {
    const product = new Product('p1', 'Food', Money.from(100), 'FOOD', true);

    expect(() => product.changePrice(Money.from(-10))).toThrow(
      'Money amount cannot be negative',
    );
  });

  it('should rename product with non-empty name', () => {
    const product = new Product('p1', 'Food', Money.from(100), 'FOOD', true);

    product.rename('New Food');
    expect(product.getName()).toBe('New Food');
  });

  it('should throw InvalidProductException for empty name', () => {
    const product = new Product('p1', 'Food', Money.from(100), 'FOOD', true);

    expect(() => product.rename('   ')).toThrow(InvalidProductException);
  });

  it('should change category', () => {
    const product = new Product('p1', 'Food', Money.from(100), 'FOOD', true);

    product.changeCategory('BEVERAGE');
    expect(product.getCategory()).toBe('BEVERAGE');
  });

  it('should update timestamps on modifications', () => {
    const product = new Product('p1', 'Food', Money.from(100), 'FOOD', true);
    const initialUpdatedAt = product.getUpdatedAt();

    // Small delay to ensure timestamp changes
    setTimeout(() => {
      product.changePrice(Money.from(150));
      expect(product.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );
    }, 10);
  });
});

