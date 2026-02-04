import { OrderStatus } from '../../../domain/enums/order-status.enum';
import { OrderItemResponseDto } from './order-item.dto';

/**
 * Order Response DTO
 * Returned when fetching order(s)
 */
export class OrderResponseDto {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    items: OrderItemResponseDto[];
    subtotal: number;
    discountAmount: number;
    total: number;
    currency: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
}

/**
 * Paginated Order Response DTO
 * Returned when fetching order list with pagination
 */
export class PaginatedOrderResponseDto {
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
