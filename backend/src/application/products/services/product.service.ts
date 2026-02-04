import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProductRepository, FindProductOptions } from '../../../domain/product';
import {
    ProductResponseDto,
    QueryProductsDto,
    PaginatedProductResponseDto,
} from '../dto';
import { ProductDtoMapper } from '../mappers';

/**
 * Product Filter Criteria
 */
interface ProductFilterCriteria {
    category?: string;
    isActive?: boolean;
    search?: string;
    skip?: number;
    limit?: number;
}

/**
 * Product Service
 * Application layer service for product operations
 */
@Injectable()
export class ProductService {
    constructor(
        @Inject('IProductRepository')
        private readonly productRepository: IProductRepository,
    ) { }

    /**
     * Get all products with optional filtering and pagination
     */
    async findAll(
        query: QueryProductsDto,
    ): Promise<PaginatedProductResponseDto> {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        // Build filter criteria
        const filters: ProductFilterCriteria = {
            skip,
            limit,
        };

        if (query.category) {
            filters.category = query.category;
        }
        if (query.isActive !== undefined) {
            filters.isActive = query.isActive;
        }
        if (query.search) {
            filters.search = query.search;
        }

        // Get products and total count
        const [products, total] = await Promise.all([
            this.productRepository.findAll(filters as FindProductOptions),
            this.productRepository.count(filters as FindProductOptions),
        ]);

        // Map to DTOs
        const data = ProductDtoMapper.toResponseDtoArray(products);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get product by ID
     */
    async findById(id: string): Promise<ProductResponseDto> {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return ProductDtoMapper.toResponseDto(product);
    }

    /**
     * Get products by IDs
     */
    async findByIds(ids: string[]): Promise<ProductResponseDto[]> {
        const products = await this.productRepository.findByIds(ids);
        return ProductDtoMapper.toResponseDtoArray(products);
    }

    /**
     * Get all active products
     */
    async findActiveProducts(): Promise<ProductResponseDto[]> {
        const products = await this.productRepository.findAll({
            isActive: true,
        });
        return ProductDtoMapper.toResponseDtoArray(products);
    }
}
