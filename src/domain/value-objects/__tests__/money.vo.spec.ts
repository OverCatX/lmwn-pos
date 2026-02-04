import { Money } from '../money.vo';

describe('Money Value Object', () => {
  describe('Creation and Validation', () => {
    it('should create money with positive amount', () => {
      const money = Money.from(100);
      expect(money.toNumber()).toBe(100);
      expect(money.getCurrency()).toBe('THB');
    });

    it('should create money from string', () => {
      const money = Money.from('99.99');
      expect(money.toNumber()).toBe(99.99);
    });

    it('should round to 2 decimal places', () => {
      const money = Money.from(100.505);
      expect(money.toNumber()).toBe(100.51); // Rounded up

      const money2 = Money.from(100.504);
      expect(money2.toNumber()).toBe(100.50); // Rounded down
    });

    it('should not allow negative amount', () => {
      expect(() => Money.from(-1)).toThrow();
      expect(() => Money.from(-0.01)).toThrow();
    });

    it('should handle zero amount', () => {
      const money = Money.from(0);
      expect(money.toNumber()).toBe(0);
    });

    it('should throw on invalid input', () => {
      expect(() => Money.from('invalid')).toThrow();
      expect(() => Money.from(NaN)).toThrow();
    });
  });

  describe('Addition - Financial Accuracy', () => {
    it('should add two money values accurately', () => {
      const a = Money.from(100);
      const b = Money.from(50.25);
      const result = a.add(b);
      expect(result.toNumber()).toBe(150.25);
    });

    it('should handle floating point precision issues', () => {
      // Classic floating point bug: 0.1 + 0.2 = 0.30000000000000004
      const a = Money.from(0.1);
      const b = Money.from(0.2);
      const result = a.add(b);
      expect(result.toNumber()).toBe(0.3);
    });

    it('should add multiple small amounts accurately', () => {
      let total = Money.from(0);
      for (let i = 0; i < 10; i++) {
        total = total.add(Money.from(0.1));
      }
      expect(total.toNumber()).toBe(1.0);
    });

    it('should throw when adding with different currencies', () => {
      const a = Money.from(100, 'THB');
      const b = Money.from(50, 'USD');
      expect(() => a.add(b)).toThrow();
    });
  });

  describe('Subtraction - Financial Accuracy', () => {
    it('should subtract two money values accurately', () => {
      const a = Money.from(100);
      const b = Money.from(40);
      const result = a.subtract(b);
      expect(result.toNumber()).toBe(60);
    });

    it('should handle floating point precision in subtraction', () => {
      // Classic bug: 10.00 - 0.01 = 9.989999999999998
      const a = Money.from(10.00);
      const b = Money.from(0.01);
      const result = a.subtract(b);
      expect(result.toNumber()).toBe(9.99); // ✅ Accurate!
    });

    it('should not allow negative result', () => {
      const a = Money.from(100);
      expect(() => a.subtract(Money.from(200))).toThrow();
    });

    it('should allow subtraction resulting in zero', () => {
      const a = Money.from(100);
      const result = a.subtract(Money.from(100));
      expect(result.toNumber()).toBe(0);
    });
  });

  describe('Multiplication - Financial Accuracy', () => {
    it('should multiply money by a positive factor', () => {
      const money = Money.from(100);
      const result = money.multiply(1.5);
      expect(result.toNumber()).toBe(150);
    });

    it('should handle floating point precision in multiplication', () => {
      // Classic bug: 0.3 * 3 = 0.8999999999999999
      const money = Money.from(0.3);
      const result = money.multiply(3);
      expect(result.toNumber()).toBe(0.9);
    });

    it('should handle price * quantity calculation', () => {
      const unitPrice = Money.from(33.33);
      const quantity = 3;
      const subtotal = unitPrice.multiply(quantity);
      expect(subtotal.toNumber()).toBe(99.99); //
    });

    it('should not allow negative factor', () => {
      const money = Money.from(100);
      expect(() => money.multiply(-1)).toThrow();
    });

    it('should allow multiplication by zero', () => {
      const money = Money.from(100);
      const result = money.multiply(0);
      expect(result.toNumber()).toBe(0);
    });
  });

  describe('Comparison Methods', () => {
    it('should check equality correctly', () => {
      const a = Money.from(100, 'THB');
      const b = Money.from(100, 'THB');
      const c = Money.from(200, 'THB');

      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });

    it('should handle greaterThan comparison', () => {
      const a = Money.from(100);
      const b = Money.from(50);

      expect(a.greaterThan(b)).toBe(true);
      expect(b.greaterThan(a)).toBe(false);
      expect(a.greaterThan(Money.from(100))).toBe(false); // Equal
    });

    it('should handle lessThan comparison', () => {
      const a = Money.from(50);
      const b = Money.from(100);

      expect(a.lessThan(b)).toBe(true);
      expect(b.lessThan(a)).toBe(false);
      expect(a.lessThan(Money.from(50))).toBe(false); // Equal
    });
  });

  describe('String Representation', () => {
    it('should convert to string with currency', () => {
      const money = Money.from(150.50, 'THB');
      expect(money.toString()).toBe('150.50 THB');

      const usd = Money.from(100, 'USD');
      expect(usd.toString()).toBe('100.00 USD');
    });

    it('should always show 2 decimal places in toString', () => {
      const money = Money.from(100);
      expect(money.toString()).toBe('100.00 THB');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should calculate order subtotal accurately', () => {
      // Item 1: 75.50 * 2 = 151.00
      const item1 = Money.from(75.50).multiply(2);
      // Item 2: 33.33 * 3 = 99.99
      const item2 = Money.from(33.33).multiply(3);
      // Subtotal: 151.00 + 99.99 = 250.99
      const subtotal = item1.add(item2);

      expect(subtotal.toNumber()).toBe(250.99);
    });

    it('should handle discount calculation accurately', () => {
      const subtotal = Money.from(250.99);
      const discount = Money.from(25.10);
      const total = subtotal.subtract(discount);

      expect(total.toNumber()).toBe(225.89);
    });

    it('should handle percentage discount accurately', () => {
      const price = Money.from(100);
      const discount = price.multiply(0.1); // 10% off
      const finalPrice = price.subtract(discount);

      expect(discount.toNumber()).toBe(10.0);
      expect(finalPrice.toNumber()).toBe(90.0);
    });

    it('should handle tax calculation accurately', () => {
      const price = Money.from(100);
      const tax = price.multiply(0.07); // 7% tax
      const total = price.add(tax);

      expect(tax.toNumber()).toBe(7.0);
      expect(total.toNumber()).toBe(107.0);
    });

    it('should accumulate many small transactions accurately', () => {
      // Simulate 100 transactions of 0.01 THB each
      let total = Money.from(0);
      for (let i = 0; i < 100; i++) {
        total = total.add(Money.from(0.01));
      }

      expect(total.toNumber()).toBe(1.0);
    });
  });
});
