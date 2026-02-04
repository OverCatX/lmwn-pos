import { applyDecorators } from '@nestjs/common';
import {
    ApiOperation,
    ApiBody,
    ApiParam,
    ApiQuery,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import {
    CreateOrderDto,
    OrderResponseDto,
    UpdateOrderStatusDto,
    ApplyDiscountDto,
    PaginatedOrderResponseDto,
} from '../../application/orders/dto';
import {
    BadRequestSchema,
    OrderNotFoundSchema,
    InternalServerErrorSchema,
    InvalidOrderStateSchema,
    InvalidDiscountSchema,
} from '../swagger';

/**
 * Swagger decorator for Create Order endpoint (POST /orders)
 */
export function ApiCreateOrder() {
    return applyDecorators(
        ApiOperation({
            summary: 'Create a new order',
            description:
                'Creates a new order with items and returns the created order with status PENDING',
        }),
        ApiBody({
            type: CreateOrderDto,
            description: 'Order data',
            examples: {
                'Simple Order': {
                    value: {
                        items: [
                            {
                                productId: '123e4567-e89b-12d3-a456-426614174000',
                                quantity: 2,
                            },
                            {
                                productId: '123e4567-e89b-12d3-a456-426614174001',
                                quantity: 1,
                            },
                        ],
                        createdBy: 'staff-001',
                    },
                },
            },
        }),
        ApiCreatedResponse({
            description: 'Order created successfully',
            type: OrderResponseDto,
        }),
        ApiBadRequestResponse({
            description: 'Invalid input data or business rule violation',
            schema: BadRequestSchema,
        }),
        ApiInternalServerErrorResponse({
            description: 'Internal server error',
            schema: InternalServerErrorSchema,
        }),
    );
}

/**
 * Swagger decorator for Get All Orders endpoint (GET /orders)
 */
export function ApiGetAllOrders() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get all orders',
            description:
                'Returns a paginated list of orders with optional filtering by status',
        }),
        ApiQuery({
            name: 'page',
            required: false,
            type: Number,
            description: 'Page number (default: 1)',
            example: 1,
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            type: Number,
            description: 'Items per page (default: 10, max: 100)',
            example: 10,
        }),
        ApiQuery({
            name: 'status',
            required: false,
            enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
            description: 'Filter by order status',
            example: 'PENDING',
        }),
        ApiOkResponse({
            description: 'Orders retrieved successfully',
            type: PaginatedOrderResponseDto,
        }),
        ApiInternalServerErrorResponse({
            description: 'Internal server error',
            schema: InternalServerErrorSchema,
        }),
    );
}

/**
 * Swagger decorator for Get Order By ID endpoint (GET /orders/:id)
 */
export function ApiGetOrderById() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get order by ID',
            description: 'Returns a single order by its ID',
        }),
        ApiParam({
            name: 'id',
            type: String,
            description: 'Order ID (UUID)',
            example: '123e4567-e89b-12d3-a456-426614174000',
        }),
        ApiOkResponse({
            description: 'Order found',
            type: OrderResponseDto,
        }),
        ApiNotFoundResponse({
            description: 'Order not found',
            schema: OrderNotFoundSchema,
        }),
        ApiInternalServerErrorResponse({
            description: 'Internal server error',
            schema: InternalServerErrorSchema,
        }),
    );
}

/**
 * Swagger decorator for Update Order Status endpoint (PATCH /orders/:id/status)
 */
export function ApiUpdateOrderStatus() {
    return applyDecorators(
        ApiOperation({
            summary: 'Update order status',
            description:
                'Updates the status of an order (follows state machine: PENDING → CONFIRMED → PREPARING → READY → COMPLETED)',
        }),
        ApiParam({
            name: 'id',
            type: String,
            description: 'Order ID (UUID)',
            example: '123e4567-e89b-12d3-a456-426614174000',
        }),
        ApiBody({
            type: UpdateOrderStatusDto,
            description: 'New status',
            examples: {
                'Confirm Order': {
                    value: {
                        status: 'CONFIRMED',
                    },
                },
                'Complete Order': {
                    value: {
                        status: 'COMPLETED',
                    },
                },
            },
        }),
        ApiOkResponse({
            description: 'Order status updated successfully',
            type: OrderResponseDto,
        }),
        ApiBadRequestResponse({
            description: 'Invalid status transition',
            schema: InvalidOrderStateSchema,
        }),
        ApiNotFoundResponse({
            description: 'Order not found',
            schema: OrderNotFoundSchema,
        }),
        ApiInternalServerErrorResponse({
            description: 'Internal server error',
            schema: InternalServerErrorSchema,
        }),
    );
}

/**
 * Swagger decorator for Apply Discount endpoint (PATCH /orders/:id/discount)
 */
export function ApiApplyDiscount() {
    return applyDecorators(
        ApiOperation({
            summary: 'Apply discount to order',
            description:
                'Applies a discount to an order (discount cannot exceed subtotal)',
        }),
        ApiParam({
            name: 'id',
            type: String,
            description: 'Order ID (UUID)',
            example: '123e4567-e89b-12d3-a456-426614174000',
        }),
        ApiBody({
            type: ApplyDiscountDto,
            description: 'Discount amount',
            examples: {
                'Fixed Discount': {
                    value: {
                        discountAmount: 50.0,
                    },
                },
            },
        }),
        ApiOkResponse({
            description: 'Discount applied successfully',
            type: OrderResponseDto,
        }),
        ApiBadRequestResponse({
            description: 'Invalid discount amount',
            schema: InvalidDiscountSchema,
        }),
        ApiNotFoundResponse({
            description: 'Order not found',
            schema: OrderNotFoundSchema,
        }),
        ApiInternalServerErrorResponse({
            description: 'Internal server error',
            schema: InternalServerErrorSchema,
        }),
    );
}

/**
 * Swagger decorator for Delete Order endpoint (DELETE /orders/:id)
 */
export function ApiDeleteOrder() {
    return applyDecorators(
        ApiOperation({
            summary: 'Delete order',
            description:
                'Soft deletes an order (order is marked as deleted but not removed from database)',
        }),
        ApiParam({
            name: 'id',
            type: String,
            description: 'Order ID (UUID)',
            example: '123e4567-e89b-12d3-a456-426614174000',
        }),
        ApiResponse({
            status: 204,
            description: 'Order deleted successfully (no content returned)',
        }),
        ApiNotFoundResponse({
            description: 'Order not found',
            schema: OrderNotFoundSchema,
        }),
        ApiInternalServerErrorResponse({
            description: 'Internal server error',
            schema: InternalServerErrorSchema,
        }),
    );
}
