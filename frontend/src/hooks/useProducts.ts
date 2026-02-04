import { useQuery } from '@tanstack/react-query';
import { ProductsApi } from '../services';

/**
 * Custom hook for fetching products list
 */
export const useProducts = (
    page = 1,
    limit = 20,
    category?: string,
    isActive?: boolean
) => {
    return useQuery({
        queryKey: ['products', page, limit, category, isActive],
        queryFn: () => ProductsApi.getProducts(page, limit, category, isActive),
    });
};

/**
 * Custom hook for fetching a single product
 */
export const useProduct = (id: string) => {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => ProductsApi.getProductById(id),
        enabled: !!id,
    });
};
