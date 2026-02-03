import { Quantity } from './quantity.vo';

describe('Quantity Value Object', () => {
  it('should create quantity with positive integer', () => {
    const qty = Quantity.from(5);
    expect(qty.toNumber()).toBe(5);
  });

  it('should not allow zero quantity', () => {
    expect(() => Quantity.from(0)).toThrow('Quantity must be greater than zero');
  });

  it('should not allow negative quantity', () => {
    expect(() => Quantity.from(-1)).toThrow('Quantity must be greater than zero');
  });

  it('should not allow non-integer quantity', () => {
    expect(() => Quantity.from(2.5)).toThrow('Quantity must be an integer');
  });

  it('should add two quantities', () => {
    const qty1 = Quantity.from(5);
    const qty2 = Quantity.from(3);
    const result = qty1.add(qty2);
    expect(result.toNumber()).toBe(8);
  });

  it('should subtract two quantities', () => {
    const qty1 = Quantity.from(5);
    const qty2 = Quantity.from(2);
    const result = qty1.subtract(qty2);
    expect(result.toNumber()).toBe(3);
  });

  it('should not allow subtraction resulting in zero or negative', () => {
    const qty1 = Quantity.from(5);
    const qty2 = Quantity.from(5);
    expect(() => qty1.subtract(qty2)).toThrow('Result must be greater than zero');
  });

  it('should multiply quantity by factor', () => {
    const qty = Quantity.from(5);
    const result = qty.multiply(2);
    expect(result.toNumber()).toBe(10);
  });

  it('should compare quantities', () => {
    const qty1 = Quantity.from(5);
    const qty2 = Quantity.from(5);
    const qty3 = Quantity.from(3);

    expect(qty1.equals(qty2)).toBe(true);
    expect(qty1.equals(qty3)).toBe(false);
    expect(qty1.greaterThan(qty3)).toBe(true);
    expect(qty3.lessThan(qty1)).toBe(true);
  });

  it('should convert to number and string', () => {
    const qty = Quantity.from(42);
    expect(qty.toNumber()).toBe(42);
    expect(qty.toString()).toBe('42');
  });
});

