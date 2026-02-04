import { DomainException } from '../../shared/exceptions/domain.exception';
import { OrderStatus } from '../enums/order-status.enum';

export class InvalidOrderStateTransitionException extends DomainException {
    constructor(
        public readonly fromStatus: OrderStatus,
        public readonly toStatus: OrderStatus,
        message?: string,
    ) {
        super(
            message || `Invalid state transition from ${fromStatus} to ${toStatus}`,
            'INVALID_STATE_TRANSITION',
            { fromStatus, toStatus },
        );
        this.name = 'InvalidOrderStateTransitionException';
    }

    static cannotTransition(from: OrderStatus, to: OrderStatus): InvalidOrderStateTransitionException {
        return new InvalidOrderStateTransitionException(
            from,
            to,
            `Cannot transition order from ${from} to ${to}`,
        );
    }

    static orderCompleted(): InvalidOrderStateTransitionException {
        return new InvalidOrderStateTransitionException(
            OrderStatus.COMPLETED,
            OrderStatus.COMPLETED,
            'Cannot modify a completed order',
        );
    }

    static orderCancelled(): InvalidOrderStateTransitionException {
        return new InvalidOrderStateTransitionException(
            OrderStatus.CANCELLED,
            OrderStatus.CANCELLED,
            'Cannot modify a cancelled order',
        );
    }
}
