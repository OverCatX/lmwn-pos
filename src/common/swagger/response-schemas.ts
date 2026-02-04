/**
 * Common Swagger Response Schemas
 * Reusable error response examples for consistent API documentation
 */

export const BadRequestSchema = {
    example: {
        statusCode: 400,
        timestamp: '2024-12-01T10:00:00.000Z',
        message: 'Validation error or business rule violation',
        error: 'Bad Request',
    },
};

export const NotFoundSchema = {
    example: {
        statusCode: 404,
        timestamp: '2024-12-01T10:00:00.000Z',
        message: 'Resource not found',
        error: 'Not Found',
    },
};

export const InternalServerErrorSchema = {
    example: {
        statusCode: 500,
        timestamp: '2024-12-01T10:00:00.000Z',
        message: 'Internal server error',
        error: 'Internal Server Error',
    },
};

export const InvalidOrderStateSchema = {
    example: {
        statusCode: 400,
        timestamp: '2024-12-01T10:00:00.000Z',
        message: 'Invalid state transition from COMPLETED to PENDING',
        error: 'InvalidOrderStateException',
    },
};

export const InvalidDiscountSchema = {
    example: {
        statusCode: 400,
        timestamp: '2024-12-01T10:00:00.000Z',
        message: 'Discount amount 500.00 exceeds subtotal 200.00',
        error: 'InvalidDiscountException',
    },
};

export const OrderNotFoundSchema = {
    example: {
        statusCode: 404,
        timestamp: '2024-12-01T10:00:00.000Z',
        message: 'Order not found with id: 123e4567-e89b-12d3-a456-426614174000',
        error: 'NotFoundException',
    },
};
