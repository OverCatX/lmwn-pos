import { OrderNumber } from './order-number.vo';

describe('OrderNumber Value Object', () => {
  it('should generate order number with correct format', () => {
    const orderNumber = OrderNumber.generate(new Date('2024-12-01'));
    const value = orderNumber.toString();

    expect(value).toMatch(/^ORD-2024-1201-\d{3}$/);
  });

  it('should create order number from valid string', () => {
    const orderNumber = OrderNumber.from('ORD-2024-1201-001');
    expect(orderNumber.toString()).toBe('ORD-2024-1201-001');
  });

  it('should throw error for invalid format', () => {
    expect(() => OrderNumber.from('INVALID-ORDER-001')).toThrow(
      'Invalid order number format',
    );
    expect(() => OrderNumber.from('ORD-2024-12-001')).toThrow(
      'Invalid order number format',
    );
  });

  it('should check equality correctly', () => {
    const order1 = OrderNumber.from('ORD-2024-1201-001');
    const order2 = OrderNumber.from('ORD-2024-1201-001');
    const order3 = OrderNumber.from('ORD-2024-1201-002');

    expect(order1.equals(order2)).toBe(true);
    expect(order1.equals(order3)).toBe(false);
  });
});

