import { apiClient } from './api';
import type {
    Order,
    PaginatedOrderResponse,
    CreateOrderRequest,
    UpdateOrderStatusRequest,
    ApplyDiscountRequest,
} from '../types/order.types';

/**
 * Orders API Service
 * Handles all order-related API calls
 */
export class OrdersApi {
    private static readonly BASE_PATH = '/orders';

    /**
     * Get all orders with pagination
     */
    static async getOrders(
        page = 1,
        limit = 10,
        status?: string
    ): Promise<PaginatedOrderResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (status) {
            params.append('status', status);
        }

        const response = await apiClient.get<PaginatedOrderResponse>(
            `${this.BASE_PATH}?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get order by ID
     */
    static async getOrderById(id: string): Promise<Order> {
        const response = await apiClient.get<Order>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }

    /**
     * Create new order
     */
    static async createOrder(data: CreateOrderRequest): Promise<Order> {
        const response = await apiClient.post<Order>(this.BASE_PATH, data);
        return response.data;
    }

    /**
     * Update order status
     */
    static async updateOrderStatus(
        id: string,
        data: UpdateOrderStatusRequest
    ): Promise<Order> {
        const response = await apiClient.patch<Order>(
            `${this.BASE_PATH}/${id}/status`,
            data
        );
        return response.data;
    }

    /**
     * Apply discount to order
     */
    static async applyDiscount(
        id: string,
        data: ApplyDiscountRequest
    ): Promise<Order> {
        const response = await apiClient.patch<Order>(
            `${this.BASE_PATH}/${id}/discount`,
            data
        );
        return response.data;
    }
}
