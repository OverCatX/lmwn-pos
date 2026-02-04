import { Order } from '../../../domain/order';
import { OrderItem } from '../../../domain/order';
import {
    OrderResponseDto,
    OrderItemResponseDto,
    PaginatedOrderResponseDto,
} from '../dto';

/**
 * Order DTO Mapper
 * Converts between Domain entities and Application DTOs
 * Separates from Infrastructure Mapper (ORM ↔ Domain)
 */
export class OrderDtoMapper {
    /**
     * Convert Order domain entity to OrderResponseDto
     */
    static toResponseDto(order: Order): OrderResponseDto {
        return {
            id: order.getId(),
            orderNumber: order.getOrderNumber().toString(),
            status: order.getStatus(),
            items: order.getItems().map((item) => this.toItemResponseDto(item)),
            subtotal: order.getSubtotal().toNumber(),
            tax: order.getTax().toNumber(),
            discountAmount: order.getDiscountAmount().toNumber(),
            discountAppliedAt: order.getDiscountAppliedAt() || null,
            total: order.getTotal().toNumber(),
            currency: order.getSubtotal().getCurrency(),
            createdBy: order.getCreatedBy(),
            createdAt: order.getCreatedAt(),
            updatedAt: order.getUpdatedAt(),
            completedAt: order.getCompletedAt() || null,
        };
    }

    /**
     * Convert OrderItem domain entity to OrderItemResponseDto
     */
    static toItemResponseDto(item: OrderItem): OrderItemResponseDto {
        return {
            id: item.getId(),
            productId: item.getProductId(),
            productName: item.getProductName(),
            quantity: item.getQuantity().toNumber(),
            unitPrice: item.getUnitPrice().toNumber(),
            subtotal: item.calculateSubtotal().toNumber(),
            discountAmount: item.getDiscountAmount().toNumber(),
            total: item.calculateTotal().toNumber(),
        };
    }

    /**
     * Convert array of Order entities to OrderResponseDto array
     */
    static toResponseDtoList(orders: Order[]): OrderResponseDto[] {
        return orders.map((order) => this.toResponseDto(order));
    }

    /**
     * Convert to paginated response
     */
    static toPaginatedResponse(
        orders: Order[],
        total: number,
        page: number,
        limit: number,
    ): PaginatedOrderResponseDto {
        return {
            data: this.toResponseDtoList(orders),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
