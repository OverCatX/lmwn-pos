import { Order } from '../entities/order.entity';
import { OrderNumber } from '../value-objects/order-number.vo';
import { OrderStatus } from '../enums/order-status.enum';

/**
 * Options for finding orders
 */
export interface FindOrderOptions {
    status?: OrderStatus;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
}

/**
 * Order Repository Interface
 * Defines the contract for order data access
 * Implementation should be in the infrastructure layer
 */
export interface IOrderRepository {
    /**
     * Save a new order
     * @param order - The order entity to save
     * @returns The saved order
     */
    save(order: Order): Promise<Order>;

    /**
     * Update an existing order
     * @param order - The order entity to update
     * @returns The updated order
     */
    update(order: Order): Promise<Order>;

    /**
     * Find an order by ID
     * @param id - The order ID
     * @returns The order if found, null otherwise
     */
    findById(id: string): Promise<Order | null>;

    /**
     * Find an order by order number
     * @param orderNumber - The order number
     * @returns The order if found, null otherwise
     */
    findByOrderNumber(orderNumber: OrderNumber): Promise<Order | null>;

    /**
     * Find all orders with optional filters
     * @param options - Filter and pagination options
     * @returns Array of orders
     */
    findAll(options?: FindOrderOptions): Promise<Order[]>;

    /**
     * Count orders with optional filters
     * @param options - Filter options
     * @returns Total count of orders
     */
    count(options?: FindOrderOptions): Promise<number>;

    /**
     * Delete an order (soft delete recommended for audit trail)
     * @param id - The order ID
     */
    delete(id: string): Promise<void>;
}
