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
}
