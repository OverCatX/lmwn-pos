/**
 * Product interface
 */
export interface Product {
    id: string;
    name: string;
    description?: string;
    price: string;
    category?: string;
    isActive: boolean;
    stock: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Paginated Product Response
 */
export interface PaginatedProductResponse {
    data: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
