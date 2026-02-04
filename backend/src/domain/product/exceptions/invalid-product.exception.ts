import { DomainException } from '../../shared/exceptions/domain.exception';

/**
 * Exception thrown when product validation fails
 */
export class InvalidProductException extends DomainException {
    constructor(message: string, details?: Record<string, unknown>) {
        super(message, 'INVALID_PRODUCT', details);
    }

    static emptyName(): InvalidProductException {
        return new InvalidProductException('Product name cannot be empty');
    }

    static negativePrice(price: number): InvalidProductException {
        return new InvalidProductException(
            `Product price cannot be negative (received: ${price})`,
            { price },
        );
    }
}
