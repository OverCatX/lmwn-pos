import { OrderStatus } from '../enums/order-status.enum';
import { Order } from '../entities/order.entity';
import { InvalidOrderStateTransitionException } from '../exceptions/invalid-order-state-transition.exception';

/**
 * Order State Machine Domain Service
 * Manages order state transitions with validation
 *
 * State Flow:
 * PENDING to CONFIRMED to PREPARING to READY to COMPLETED
 * PENDING to READY can be cancelled
 *
 * Terminal States: COMPLETED, CANCELLED (no further transitions)
 */
export class OrderStateMachine {
    private static readonly VALID_TRANSITIONS: Map<OrderStatus, OrderStatus[]> = new Map([
        [OrderStatus.PENDING, [OrderStatus.CONFIRMED, OrderStatus.CANCELLED]],
        [OrderStatus.CONFIRMED, [OrderStatus.PREPARING, OrderStatus.CANCELLED]],
        [OrderStatus.PREPARING, [OrderStatus.READY, OrderStatus.CANCELLED]],
        [OrderStatus.READY, [OrderStatus.COMPLETED, OrderStatus.CANCELLED]],
        [OrderStatus.COMPLETED, []],
        [OrderStatus.CANCELLED, []],
    ]);

    canTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
        if (currentStatus === newStatus) {
            return false;
        }

        const allowedTransitions = OrderStateMachine.VALID_TRANSITIONS.get(currentStatus);

        if (!allowedTransitions) {
            return false;
        }

        return allowedTransitions.includes(newStatus);
    }

    validateTransition(order: Order, newStatus: OrderStatus): void {
        const currentStatus = order.getStatus();

        if (currentStatus === newStatus) {
            throw new InvalidOrderStateTransitionException(
                currentStatus,
                newStatus,
                'Order is already in the target state',
            );
        }

        if (currentStatus === OrderStatus.COMPLETED) {
            throw InvalidOrderStateTransitionException.orderCompleted();
        }

        if (currentStatus === OrderStatus.CANCELLED) {
            throw InvalidOrderStateTransitionException.orderCancelled();
        }

        if (!this.canTransition(currentStatus, newStatus)) {
            throw InvalidOrderStateTransitionException.cannotTransition(
                currentStatus,
                newStatus,
            );
        }
    }

    getAllowedTransitions(currentStatus: OrderStatus): OrderStatus[] {
        return OrderStateMachine.VALID_TRANSITIONS.get(currentStatus) || [];
    }

    isTerminalState(status: OrderStatus): boolean {
        return status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED;
    }

    isValidStatus(status: string): status is OrderStatus {
        return Object.values(OrderStatus).includes(status as OrderStatus);
    }
}
