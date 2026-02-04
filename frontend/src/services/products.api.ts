import { apiClient } from './api';
import type { Product, PaginatedProductResponse } from '../types/product.types';

/**
 * Products API Service
 * Handles all product-related API calls
 */
export class ProductsApi {
    private static readonly BASE_PATH = '/products';

    /**
     * Get all products with pagination
     */
    static async getProducts(
        page = 1,
        limit = 20,
        category?: string,
        isActive?: boolean
    ): Promise<PaginatedProductResponse> {
        const params: Record<string, string> = {
            page: page.toString(),
            limit: limit.toString(),
        };

        if (category) {
            params.category = category;
        }

        if (isActive !== undefined) {
            params.isActive = isActive.toString();
        }

        const response = await apiClient.get<PaginatedProductResponse>(
            this.BASE_PATH,
            { params }
        );
        return response.data;
    }

    /**
     * Get product by ID
     */
    static async getProductById(id: string): Promise<Product> {
        const response = await apiClient.get<Product>(`${this.BASE_PATH}/${id}`);
        return response.data;
    }
}
