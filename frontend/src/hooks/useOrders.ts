import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { OrdersApi } from '../services';
import { handleApiError } from '../services/api';
import type {
    CreateOrderRequest,
    UpdateOrderStatusRequest,
    ApplyDiscountRequest,
} from '../types/order.types';

/**
 * Custom hook for fetching orders list
 */
export const useOrders = (page = 1, limit = 10, status?: string) => {
    return useQuery({
        queryKey: ['orders', page, limit, status],
        queryFn: () => OrdersApi.getOrders(page, limit, status),
    });
};

/**
 * Custom hook for fetching a single order
 */
export const useOrder = (id: string) => {
    return useQuery({
        queryKey: ['order', id],
        queryFn: () => OrdersApi.getOrderById(id),
        enabled: !!id,
    });
};

/**
 * Custom hook for creating an order
 */
export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderRequest) => OrdersApi.createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            message.success('Order created successfully');
        },
        onError: (error) => {
            message.error(handleApiError(error));
        },
    });
};

/**
 * Custom hook for updating order status
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateOrderStatusRequest }) =>
            OrdersApi.updateOrderStatus(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
            message.success('Order status updated successfully');
        },
        onError: (error) => {
            message.error(handleApiError(error));
        },
    });
};

/**
 * Custom hook for applying discount
 */
export const useApplyDiscount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ApplyDiscountRequest }) =>
            OrdersApi.applyDiscount(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
            message.success('Discount applied successfully');
        },
        onError: (error) => {
            message.error(handleApiError(error));
        },
    });
};
