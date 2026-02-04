import { apiClient } from './api';
import type {
  Order,
  PaginatedOrderResponse,
  CreateOrderRequest,
  UpdateOrderStatusRequest,
  ApplyDiscountRequest,
} from '../types/order.types';

export class OrdersApi {
  private static readonly BASE_PATH = '/orders';

  static async getOrders(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<PaginatedOrderResponse> {
    const response = await apiClient.get<PaginatedOrderResponse>(
      this.BASE_PATH,
      { params: { page, limit, status } }
    );
    return response.data;
  }

  static async getOrderById(id: string): Promise<Order> {
    const response = await apiClient.get<Order>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  static async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await apiClient.post<Order>(this.BASE_PATH, data);
    return response.data;
  }

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

  static async removeDiscount(id: string): Promise<Order> {
    const response = await apiClient.delete<Order>(
      `${this.BASE_PATH}/${id}/discount`
    );
    return response.data;
  }

  static async deleteOrder(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}
