import { Money } from '../value-objects/money.vo';
import { InvalidDiscountException } from '../exceptions';

/**
 * Discount Calculator Domain Service
 * Handles all discount calculation logic with financial precision
 */
export class DiscountCalculator {
    /**
     * Calculate percentage discount with optional max limit
     * @param amount - Amount to discount from
     * @param percentage - Percentage (0-100)
     * @param maxDiscount - Optional max discount limit
     * @returns Calculated discount amount
     */
    calculatePercentageDiscount(
        amount: Money,
        percentage: number,
        maxDiscount?: Money,
    ): Money {
        if (percentage < 0 || percentage > 100) {
            throw InvalidDiscountException.invalidPercentage(percentage);
        }

        if (amount.toNumber() < 0) {
            throw InvalidDiscountException.negativeDiscount();
        }

        const discount = amount.multiply(percentage).multiply(0.01);

        if (maxDiscount && discount.greaterThan(maxDiscount)) {
            return maxDiscount;
        }

        return discount;
    }

    /**
     * Calculate fixed amount discount
     * @param subtotal - Subtotal amount
     * @param fixedAmount - Fixed discount amount
     * @returns Discount amount (won't exceed subtotal)
     */
    calculateFixedDiscount(subtotal: Money, fixedAmount: Money): Money {
        if (fixedAmount.toNumber() < 0) {
            throw InvalidDiscountException.negativeDiscount();
        }

        if (fixedAmount.greaterThan(subtotal)) {
            throw InvalidDiscountException.exceedsSubtotal(
                fixedAmount.toNumber(),
                subtotal.toNumber(),
            );
        }

        return fixedAmount;
    }

    /**
     * Validate discount against minimum purchase requirement
     * @param subtotal - Order subtotal
     * @param minPurchase - Minimum purchase requirement
     * @returns true if valid
     */
    validateMinPurchase(subtotal: Money, minPurchase?: Money): boolean {
        if (!minPurchase) {
            return true;
        }

        return subtotal.greaterThan(minPurchase) || subtotal.equals(minPurchase);
    }

    /**
     * Validate discount time validity
     * @param validFrom - Valid from date
     * @param validUntil - Valid until date
     * @param currentDate - Current date (defaults to now)
     * @returns true if valid
     */
    validateTimeValidity(
        validFrom?: Date,
        validUntil?: Date,
        currentDate: Date = new Date(),
    ): boolean {
        if (validFrom && currentDate < validFrom) {
            return false;
        }

        if (validUntil && currentDate > validUntil) {
            return false;
        }

        return true;
    }

    /**
     * Calculate final discount amount with all validations
     * @param subtotal - Order subtotal
     * @param discountType - 'percentage' or 'fixed'
     * @param discountValue - Percentage (0-100) or fixed amount
     * @param options - Optional constraints (minPurchase, maxDiscount, time validity)
     * @returns Final discount amount
     */
    calculateDiscount(
        subtotal: Money,
        discountType: 'percentage' | 'fixed',
        discountValue: number,
        options?: {
            minPurchase?: Money;
            maxDiscount?: Money;
            validFrom?: Date;
            validUntil?: Date;
        },
    ): Money {
        // Validate minimum purchase
        if (options?.minPurchase && !this.validateMinPurchase(subtotal, options.minPurchase)) {
            throw InvalidDiscountException.belowMinPurchase(
                subtotal.toNumber(),
                options.minPurchase.toNumber(),
            );
        }

        // Validate time validity
        if (!this.validateTimeValidity(options?.validFrom, options?.validUntil)) {
            throw InvalidDiscountException.notValidTime();
        }

        // Calculate discount based on type
        if (discountType === 'percentage') {
            return this.calculatePercentageDiscount(
                subtotal,
                discountValue,
                options?.maxDiscount,
            );
        } else {
            const fixedAmount = Money.from(discountValue, subtotal.getCurrency());
            return this.calculateFixedDiscount(subtotal, fixedAmount);
        }
    }
}
