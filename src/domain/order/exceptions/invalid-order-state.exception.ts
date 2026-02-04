import { DomainException } from '../../shared/exceptions/domain.exception';
import { OrderStatus } from '../enums/order-status.enum';

/**
 * Exception thrown when an invalid order state transition is attempted
 */
export class InvalidOrderStateException extends DomainException {
    constructor(
        message: string,
        public readonly currentStatus: OrderStatus,
        public readonly attemptedStatus: OrderStatus,
    ) {
        super(message, 'INVALID_ORDER_STATE', {
            currentStatus,
            attemptedStatus,
        });
    }

    static cannotModifyCompleted(): InvalidOrderStateException {
        return new InvalidOrderStateException(
            'Cannot modify a completed order',
            OrderStatus.COMPLETED,
            OrderStatus.COMPLETED,
        );
    }

    static invalidTransition(
        from: OrderStatus,
        to: OrderStatus,
    ): InvalidOrderStateException {
        return new InvalidOrderStateException(
            `Invalid order state transition from ${from} to ${to}`,
            from,
            to,
        );
    }
}
