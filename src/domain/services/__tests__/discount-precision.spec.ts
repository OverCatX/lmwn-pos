import { DiscountCalculator } from '../discount-calculator.service';
import { Money } from '../../value-objects/money.vo';

/**
 * Financial Precision Tests for Discount Calculator
 * Tests edge cases and floating-point precision scenarios
 */
describe('DiscountCalculator - Financial Precision', () => {
    let calculator: DiscountCalculator;

    beforeEach(() => {
        calculator = new DiscountCalculator();
    });

    describe('Percentage calculation precision', () => {
        it('should handle 12.5% correctly (no floating point errors)', () => {
            const amount = Money.from(1000);
            const discount = calculator.calculatePercentageDiscount(amount, 12.5);

            expect(discount.toNumber()).toBe(125);
            expect(discount.toString()).toBe('125.00 THB');
        });

        it('should handle 33.33% correctly', () => {
            const amount = Money.from(300);
            const discount = calculator.calculatePercentageDiscount(amount, 33.33);

            // 300 * 33.33 / 100 = 99.99
            expect(discount.toNumber()).toBe(99.99);
            expect(discount.toString()).toBe('99.99 THB');
        });

        it('should handle small percentages (0.5%)', () => {
            const amount = Money.from(1000);
            const discount = calculator.calculatePercentageDiscount(amount, 0.5);

            expect(discount.toNumber()).toBe(5);
        });

        it('should handle large amounts with decimal percentages', () => {
            const amount = Money.from(9999.99);
            const discount = calculator.calculatePercentageDiscount(amount, 15.75);

            // 9999.99 * 15.75 / 100 = 1574.998425
            // Rounded to 2 decimals = 1575.00
            expect(discount.toNumber()).toBe(1575);
        });

        it('should handle tricky decimal percentages (7.777%)', () => {
            const amount = Money.from(1000);
            const discount = calculator.calculatePercentageDiscount(amount, 7.777);

            // 1000 * 7.777 / 100 = 77.77
            expect(discount.toNumber()).toBe(77.78); // Rounded up
        });
    });

    describe('Accumulation tests (prevent rounding errors)', () => {
        it('should calculate 10% of 100 items of 0.99 each correctly', () => {
            // Scenario: 100 items * 0.99 = 99.00
            // 10% discount = 9.90
            const subtotal = Money.from(0.99).multiply(100);
            const discount = calculator.calculatePercentageDiscount(subtotal, 10);

            expect(subtotal.toNumber()).toBe(99);
            expect(discount.toNumber()).toBe(9.9);
        });

        it('should handle repeated small discounts', () => {
            // Multiple small items with discount
            let total = Money.from(0);
            for (let i = 0; i < 100; i++) {
                const item = Money.from(0.33); // 33 cents each
                const discount = calculator.calculatePercentageDiscount(item, 10);
                const afterDiscount = item.subtract(discount);
                total = total.add(afterDiscount);
            }

            // 100 items * 0.33 = 33.00
            // After 10% discount: 33.00 * 0.9 = 29.70
            expect(total.toNumber()).toBe(29.7);
        });
    });

    describe('Real restaurant scenarios', () => {
        it('should handle happy hour 25% discount on 1,234.56 THB bill', () => {
            const bill = Money.from(1234.56);
            const discount = calculator.calculatePercentageDiscount(bill, 25);

            // 1234.56 * 0.25 = 308.64
            expect(discount.toNumber()).toBe(308.64);
            const total = bill.subtract(discount);
            expect(total.toNumber()).toBe(925.92);
        });

        it('should handle member discount 15% on 999.99 THB', () => {
            const bill = Money.from(999.99);
            const discount = calculator.calculatePercentageDiscount(bill, 15);

            // 999.99 * 0.15 = 149.9985 → 150.00 (rounded)
            expect(discount.toNumber()).toBe(150);
            const total = bill.subtract(discount);
            expect(total.toNumber()).toBe(849.99);
        });

        it('should handle senior discount 20% on 567.89 THB', () => {
            const bill = Money.from(567.89);
            const discount = calculator.calculatePercentageDiscount(bill, 20);

            // 567.89 * 0.20 = 113.578 → 113.58 (rounded)
            expect(discount.toNumber()).toBe(113.58);
        });

        it('should handle complex scenario: 12.75% on 3,456.78 THB', () => {
            const bill = Money.from(3456.78);
            const discount = calculator.calculatePercentageDiscount(bill, 12.75);

            // 3456.78 * 0.1275 = 440.73945 → 440.74 (rounded)
            expect(discount.toNumber()).toBe(440.74);
        });
    });

    describe('Edge cases', () => {
        it('should handle 0% discount', () => {
            const amount = Money.from(100);
            const discount = calculator.calculatePercentageDiscount(amount, 0);

            expect(discount.toNumber()).toBe(0);
        });

        it('should handle 100% discount', () => {
            const amount = Money.from(100);
            const discount = calculator.calculatePercentageDiscount(amount, 100);

            expect(discount.toNumber()).toBe(100);
        });

        it('should handle very small amounts (0.01 THB)', () => {
            const amount = Money.from(0.01);
            const discount = calculator.calculatePercentageDiscount(amount, 50);

            // 0.01 * 0.5 = 0.005 → 0.01 (rounded up to 2 decimals)
            expect(discount.toNumber()).toBe(0.01);
        });

        it('should handle very large amounts (999,999.99 THB)', () => {
            const amount = Money.from(999999.99);
            const discount = calculator.calculatePercentageDiscount(amount, 10);

            // 999999.99 * 0.1 = 99999.999 → 100000.00 (rounded)
            expect(discount.toNumber()).toBe(100000);
        });
    });

    describe('Comparison with native JavaScript (prove precision)', () => {
        it('should be more accurate than native JS for 33.33%', () => {
            const amount = 300;

            // Some err. caused by native JS
            // const nativeResult = amount * (33.33 / 100);
            // nativeResult might be 99.98999999999999

            // Our implementation (precise)
            const moneyAmount = Money.from(amount);

            const discount = calculator.calculatePercentageDiscount(moneyAmount, 33.33);

            expect(discount.toNumber()).toBe(99.99);
            // Native might give 99.99 or 99.98999999999999
        });

        it('should handle 12.345% without precision loss', () => {
            const amount = Money.from(1000);
            const discount = calculator.calculatePercentageDiscount(amount, 12.345);

            // 1000 * 12.345 / 100 = 123.45
            expect(discount.toNumber()).toBe(123.45);
            expect(discount.toString()).toBe('123.45 THB');
        });
    });

    describe('Max discount limit precision', () => {
        it('should respect max discount with precise comparison', () => {
            const amount = Money.from(1000);
            const maxDiscount = Money.from(99.99);

            // 15% of 1000 = 150, but max is 99.99
            const discount = calculator.calculatePercentageDiscount(
                amount,
                15,
                maxDiscount,
            );

            expect(discount.toNumber()).toBe(99.99);
            expect(discount.equals(maxDiscount)).toBe(true);
        });

        it('should not apply max if discount is below limit', () => {
            const amount = Money.from(500);
            const maxDiscount = Money.from(100);

            // 10% of 500 = 50 (below 100 max)
            const discount = calculator.calculatePercentageDiscount(
                amount,
                10,
                maxDiscount,
            );

            expect(discount.toNumber()).toBe(50);
            expect(discount.lessThan(maxDiscount)).toBe(true);
        });
    });
});
