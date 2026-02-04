import { applyDecorators } from '@nestjs/common';
import {
    ApiOperation,
    ApiResponse,
    ApiQuery,
    ApiParam,
} from '@nestjs/swagger';
import {
    ProductResponseDto,
    PaginatedProductResponseDto,
} from '../../application/products/dto';

/**
 * Swagger decorator for GET /products
 */
export function ApiGetAllProducts() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get all products',
            description:
                'Retrieve a paginated list of products with optional filtering by category, active status, and search term',
        }),
        ApiQuery({
            name: 'category',
            required: false,
            description: 'Filter by product category',
            example: 'Main Course',
        }),
        ApiQuery({
            name: 'isActive',
            required: false,
            description: 'Filter by active status',
            example: true,
        }),
        ApiQuery({
            name: 'search',
            required: false,
            description: 'Search by product name',
            example: 'Pad Thai',
        }),
        ApiQuery({
            name: 'page',
            required: false,
            description: 'Page number',
            example: 1,
        }),
        ApiQuery({
            name: 'limit',
            required: false,
            description: 'Number of items per page',
            example: 10,
        }),
        ApiResponse({
            status: 200,
            description: 'Products retrieved successfully',
            type: PaginatedProductResponseDto,
            example: {
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Pad Thai',
                        description: 'Thai fried noodles with shrimp',
                        price: 120.0,
                        currency: 'THB',
                        category: 'Main Course',
                        isActive: true,
                        createdAt: '2026-02-04T12:00:00.000Z',
                        updatedAt: '2026-02-04T12:00:00.000Z',
                    },
                ],
                total: 8,
                page: 1,
                limit: 10,
                totalPages: 1,
            },
        }),
        ApiResponse({
            status: 400,
            description: 'Bad Request - Invalid query parameters',
            schema: {
                example: {
                    statusCode: 400,
                    timestamp: '2026-02-04T12:00:00.000Z',
                    path: '/api/products',
                    method: 'GET',
                    message: ['page must not be less than 1'],
                    error: 'Bad Request',
                },
            },
        }),
    );
}

/**
 * Swagger decorator for GET /products/:id
 */
export function ApiGetProductById() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get product by ID',
            description: 'Retrieve a single product by its unique identifier',
        }),
        ApiParam({
            name: 'id',
            description: 'Product unique identifier (UUID)',
            example: '123e4567-e89b-12d3-a456-426614174000',
        }),
        ApiResponse({
            status: 200,
            description: 'Product retrieved successfully',
            type: ProductResponseDto,
            example: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Pad Thai',
                description: 'Thai fried noodles with shrimp, peanuts, and lime',
                price: 120.0,
                currency: 'THB',
                category: 'Main Course',
                isActive: true,
                createdAt: '2026-02-04T12:00:00.000Z',
                updatedAt: '2026-02-04T12:00:00.000Z',
            },
        }),
        ApiResponse({
            status: 404,
            description: 'Product not found',
            schema: {
                example: {
                    statusCode: 404,
                    timestamp: '2026-02-04T12:00:00.000Z',
                    path: '/api/products/123e4567-e89b-12d3-a456-426614174000',
                    method: 'GET',
                    message: 'Product with ID 123e4567-e89b-12d3-a456-426614174000 not found',
                    error: 'Not Found',
                },
            },
        }),
    );
}
