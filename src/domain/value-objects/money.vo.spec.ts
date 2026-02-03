import { Money } from './money.vo';

describe('Money Value Object', () => {
  it('should create money with positive amount', () => {
    const money = Money.from(100);
    expect(money.toNumber()).toBe(100);
    expect(money.getCurrency()).toBe('THB');
  });

  it('should not allow negative amount', () => {
    expect(() => Money.from(-1)).toThrow('Money amount cannot be negative');
  });

  it('should add two money values', () => {
    const a = Money.from(100);
    const b = Money.from(50.25);
    const result = a.add(b);
    expect(result.toNumber()).toBe(150.25);
  });

  it('should subtract two money values and not allow negative result', () => {
    const a = Money.from(100);
    const b = Money.from(40);
    const result = a.subtract(b);
    expect(result.toNumber()).toBe(60);

    expect(() => a.subtract(Money.from(200))).toThrow('Result cannot be negative');
  });

  it('should multiply money by a positive factor', () => {
    const money = Money.from(100);
    const result = money.multiply(1.5);
    expect(result.toNumber()).toBe(150);
  });

  it('should not allow negative factor in multiply', () => {
    const money = Money.from(100);
    expect(() => money.multiply(-1)).toThrow('Factor cannot be negative');
  });

  it('should throw when adding with different currencies', () => {
    const a = Money.from(100, 'THB');
    const b = Money.from(50, 'USD');
    expect(() => a.add(b)).toThrow('Currency mismatch');
  });

  it('should check equality correctly', () => {
    const a = Money.from(100, 'THB');
    const b = Money.from(100, 'THB');
    const c = Money.from(200, 'THB');

    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });

  it('should convert to string with currency', () => {
    const money = Money.from(150.50, 'THB');
    expect(money.toString()).toBe('150.5 THB');

    const usd = Money.from(100, 'USD');
    expect(usd.toString()).toBe('100 USD');
  });
});
