import { DomainException } from './domain.exception';

/**
 * Exception thrown when an invalid discount operation is attempted
 */
export class InvalidDiscountException extends DomainException {
    constructor(message: string, details?: Record<string, unknown>) {
        super(message, 'INVALID_DISCOUNT', details);
    }

    static negativeDiscount(): InvalidDiscountException {
        return new InvalidDiscountException('Discount amount cannot be negative');
    }

    static exceedsSubtotal(
        discount: number,
        subtotal: number,
    ): InvalidDiscountException {
        return new InvalidDiscountException(
            `Discount amount (${discount}) cannot exceed subtotal (${subtotal})`,
            { discount, subtotal },
        );
    }

    static invalidPercentage(percentage: number): InvalidDiscountException {
        return new InvalidDiscountException(
            `Invalid discount percentage: ${percentage}. Must be between 0 and 100`,
            { percentage },
        );
    }

    static belowMinPurchase(
        subtotal: number,
        minPurchase: number,
    ): InvalidDiscountException {
        return new InvalidDiscountException(
            `Subtotal (${subtotal}) is below minimum purchase requirement (${minPurchase})`,
            { subtotal, minPurchase },
        );
    }

    static notValidTime(): InvalidDiscountException {
        return new InvalidDiscountException(
            'Discount is not valid at this time',
        );
    }
}
