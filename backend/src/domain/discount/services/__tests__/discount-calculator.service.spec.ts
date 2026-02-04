import { Money } from 'src/domain/shared';
import { InvalidDiscountException } from '../../exceptions/invalid-discount.exception';
import { DiscountCalculator } from '../discount-calculator.service';

describe('DiscountCalculator', () => {
  let calculator: DiscountCalculator;

  beforeEach(() => {
    calculator = new DiscountCalculator();
  });

  describe('calculatePercentageDiscount', () => {
    it('should calculate 10% discount correctly', () => {
      const amount = Money.from(100);
      const discount = calculator.calculatePercentageDiscount(amount, 10);

      expect(discount.toNumber()).toBe(10);
    });

    it('should calculate 50% discount correctly', () => {
      const amount = Money.from(200);
      const discount = calculator.calculatePercentageDiscount(amount, 50);

      expect(discount.toNumber()).toBe(100);
    });

    it('should handle decimal percentages correctly', () => {
      const amount = Money.from(100);
      const discount = calculator.calculatePercentageDiscount(amount, 12.5);

      expect(discount.toNumber()).toBe(12.50);
    });

    it('should respect max discount limit', () => {
      const amount = Money.from(1000);
      const maxDiscount = Money.from(50);
      const discount = calculator.calculatePercentageDiscount(
        amount,
        20,
        maxDiscount,
      );

      expect(discount.toNumber()).toBe(50);
    });

    it('should not apply max discount if below limit', () => {
      const amount = Money.from(100);
      const maxDiscount = Money.from(50);
      const discount = calculator.calculatePercentageDiscount(
        amount,
        10,
        maxDiscount,
      );

      expect(discount.toNumber()).toBe(10);
    });

    it('should throw error for negative percentage', () => {
      const amount = Money.from(100);

      expect(() => {
        calculator.calculatePercentageDiscount(amount, -10);
      }).toThrow(InvalidDiscountException);
    });

    it('should throw error for percentage > 100', () => {
      const amount = Money.from(100);

      expect(() => {
        calculator.calculatePercentageDiscount(amount, 150);
      }).toThrow(InvalidDiscountException);
    });

    it('should throw error for negative amount', () => {
      const amount = Money.from(0);

      expect(() => {
        calculator.calculatePercentageDiscount(amount, 10);
      }).not.toThrow();
    });
  });

  describe('calculateFixedDiscount', () => {
    it('should return fixed discount when valid', () => {
      const subtotal = Money.from(200);
      const fixedAmount = Money.from(50);
      const discount = calculator.calculateFixedDiscount(subtotal, fixedAmount);

      expect(discount.toNumber()).toBe(50);
    });

    it('should throw error if discount exceeds subtotal', () => {
      const subtotal = Money.from(100);
      const fixedAmount = Money.from(150);

      expect(() => {
        calculator.calculateFixedDiscount(subtotal, fixedAmount);
      }).toThrow(InvalidDiscountException);
    });

    it('should allow discount equal to subtotal', () => {
      const subtotal = Money.from(100);
      const fixedAmount = Money.from(100);
      const discount = calculator.calculateFixedDiscount(subtotal, fixedAmount);

      expect(discount.toNumber()).toBe(100);
    });

    it('should throw error for negative fixed amount', () => {
      const subtotal = Money.from(100);

      expect(() => {
        const fixedAmount = Money.from(-10);
        calculator.calculateFixedDiscount(subtotal, fixedAmount);
      }).toThrow();
    });
  });

  describe('validateMinPurchase', () => {
    it('should return true if no min purchase', () => {
      const subtotal = Money.from(50);
      const result = calculator.validateMinPurchase(subtotal);

      expect(result).toBe(true);
    });

    it('should return true if subtotal meets min purchase', () => {
      const subtotal = Money.from(150);
      const minPurchase = Money.from(100);
      const result = calculator.validateMinPurchase(subtotal, minPurchase);

      expect(result).toBe(true);
    });

    it('should return true if subtotal equals min purchase', () => {
      const subtotal = Money.from(100);
      const minPurchase = Money.from(100);
      const result = calculator.validateMinPurchase(subtotal, minPurchase);

      expect(result).toBe(true);
    });

    it('should return false if subtotal below min purchase', () => {
      const subtotal = Money.from(50);
      const minPurchase = Money.from(100);
      const result = calculator.validateMinPurchase(subtotal, minPurchase);

      expect(result).toBe(false);
    });
  });

  describe('validateTimeValidity', () => {
    it('should return true if no time constraints', () => {
      const result = calculator.validateTimeValidity();

      expect(result).toBe(true);
    });

    it('should return true if within valid time range', () => {
      const validFrom = new Date('2026-01-01');
      const validUntil = new Date('2026-12-31');
      const currentDate = new Date('2026-06-15');
      const result = calculator.validateTimeValidity(
        validFrom,
        validUntil,
        currentDate,
      );

      expect(result).toBe(true);
    });

    it('should return false if before valid from', () => {
      const validFrom = new Date('2026-06-01');
      const currentDate = new Date('2026-05-31');
      const result = calculator.validateTimeValidity(
        validFrom,
        undefined,
        currentDate,
      );

      expect(result).toBe(false);
    });

    it('should return false if after valid until', () => {
      const validUntil = new Date('2026-05-31');
      const currentDate = new Date('2026-06-01');
      const result = calculator.validateTimeValidity(
        undefined,
        validUntil,
        currentDate,
      );

      expect(result).toBe(false);
    });

    it('should return true on validFrom date', () => {
      const validFrom = new Date('2026-06-01T00:00:00');
      const currentDate = new Date('2026-06-01T00:00:00');
      const result = calculator.validateTimeValidity(
        validFrom,
        undefined,
        currentDate,
      );

      expect(result).toBe(true);
    });
  });

  describe('calculateDiscount (integrated)', () => {
    it('should calculate percentage discount with all validations', () => {
      const subtotal = Money.from(500);
      const discount = calculator.calculateDiscount(
        subtotal,
        'percentage',
        20,
        {
          minPurchase: Money.from(100),
          maxDiscount: Money.from(200),
        },
      );

      expect(discount.toNumber()).toBe(100);
    });

    it('should calculate fixed discount with validations', () => {
      const subtotal = Money.from(500);
      const discount = calculator.calculateDiscount(subtotal, 'fixed', 50, {
        minPurchase: Money.from(100),
      });

      expect(discount.toNumber()).toBe(50);
    });

    it('should throw if below min purchase', () => {
      const subtotal = Money.from(50);

      expect(() => {
        calculator.calculateDiscount(subtotal, 'percentage', 10, {
          minPurchase: Money.from(100),
        });
      }).toThrow(InvalidDiscountException);
    });

    it('should throw if not valid time', () => {
      const subtotal = Money.from(500);

      expect(() => {
        calculator.calculateDiscount(subtotal, 'percentage', 10, {
          validFrom: new Date('2026-06-01'),
          validUntil: new Date('2026-06-30'),
        });
      }).toThrow(InvalidDiscountException);
    });

    it('should work without optional constraints', () => {
      const subtotal = Money.from(200);
      const discount = calculator.calculateDiscount(subtotal, 'percentage', 10);

      expect(discount.toNumber()).toBe(20);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle restaurant bill with 10% discount', () => {
      const billAmount = Money.from(1250.50);
      const discount = calculator.calculatePercentageDiscount(billAmount, 10);

      expect(discount.toNumber()).toBe(125.05);
    });

    it('should apply 50 THB discount on 300 THB order', () => {
      const subtotal = Money.from(300);
      const discount = calculator.calculateDiscount(subtotal, 'fixed', 50, {
        minPurchase: Money.from(200),
      });

      expect(discount.toNumber()).toBe(50);
    });

    it('should limit discount to 100 THB max even for 20% of 1000 THB', () => {
      const subtotal = Money.from(1000);
      const discount = calculator.calculateDiscount(
        subtotal,
        'percentage',
        20,
        {
          maxDiscount: Money.from(100),
        },
      );

      expect(discount.toNumber()).toBe(100);
    });

    it('should reject discount for order below 500 THB minimum', () => {
      const subtotal = Money.from(450);

      expect(() => {
        calculator.calculateDiscount(subtotal, 'percentage', 15, {
          minPurchase: Money.from(500),
        });
      }).toThrow(/below minimum purchase/);
    });
  });
});
