import { Product } from '../entities/product.entity';

/**
 * Options for finding products
 */
export interface FindProductOptions {
    category?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
}

/**
 * Product Repository Interface
 * Defines the contract for product data access
 * Implementation should be in the infrastructure layer
 */
export interface IProductRepository {
    /**
     * Save a new product
     * @param product - The product entity to save
     * @returns The saved product
     */
    save(product: Product): Promise<Product>;

    /**
     * Update an existing product
     * @param product - The product entity to update
     * @returns The updated product
     */
    update(product: Product): Promise<Product>;

    /**
     * Find a product by ID
     * @param id - The product ID
     * @returns The product if found, null otherwise
     */
    findById(id: string): Promise<Product | null>;

    /**
     * Find multiple products by IDs
     * @param ids - Array of product IDs
     * @returns Array of products
     */
    findByIds(ids: string[]): Promise<Product[]>;

    /**
     * Find all products with optional filters
     * @param options - Filter and pagination options
     * @returns Array of products
     */
    findAll(options?: FindProductOptions): Promise<Product[]>;

    /**
     * Count products with optional filters
     * @param options - Filter options
     * @returns Total count of products
     */
    count(options?: FindProductOptions): Promise<number>;

    /**
     * Delete a product (soft delete recommended)
     * @param id - The product ID
     */
    delete(id: string): Promise<void>;
}
