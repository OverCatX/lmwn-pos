import { DomainException } from '../../shared/exceptions/domain.exception';

/**
 * Exception thrown when an order item is not found
 */
export class OrderItemNotFoundException extends DomainException {
    constructor(public readonly itemId: string) {
        super(`Order item with id '${itemId}' not found`, 'ORDER_ITEM_NOT_FOUND', {
            itemId,
        });
    }
}
