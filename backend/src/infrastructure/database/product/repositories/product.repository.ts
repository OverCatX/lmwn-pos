import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../../domain/product';
import {
    IProductRepository,
    FindProductOptions,
} from '../../../../domain/product';
import { ProductOrmEntity } from '../entities/product.orm.entity';
import { ProductMapper } from '../mappers/product.mapper';

/**
 * Product Repository
 * This repo using TypeORM
 */
@Injectable()
export class ProductRepository implements IProductRepository {
    constructor(
        @InjectRepository(ProductOrmEntity)
        private readonly ormRepository: Repository<ProductOrmEntity>,
    ) { }

    /**
     * Save a new product
     */
    async save(product: Product): Promise<Product> {
        try {
            const ormEntity = ProductMapper.toOrm(product);
            const saved = await this.ormRepository.save(ormEntity);
            return ProductMapper.toDomain(saved);
        } catch (error) {
            throw this.handleError(error, 'save');
        }
    }

    /**
     * Update product that exists
     */
    async update(product: Product): Promise<Product> {
        try {
            const id = product.getId();
            const partial = ProductMapper.toOrmPartial(product);

            await this.ormRepository.update(id, partial);

            const updated = await this.ormRepository.findOne({ where: { id } });
            if (!updated) {
                throw new Error(`Product with id ${id} not found after update`);
            }

            return ProductMapper.toDomain(updated);
        } catch (error) {
            throw this.handleError(error, 'update');
        }
    }

    /**
     * Find product by ID
     */
    async findById(id: string): Promise<Product | null> {
        try {
            const orm = await this.ormRepository.findOne({ where: { id } });
            return orm ? ProductMapper.toDomain(orm) : null;
        } catch (error) {
            throw this.handleError(error, 'findById');
        }
    }

    /**
     * Find products by IDs
     */
    async findByIds(ids: string[]): Promise<Product[]> {
        try {
            if (ids.length === 0) {
                return [];
            }

            const ormList = await this.ormRepository
                .createQueryBuilder('product')
                .where('product.id IN (:...ids)', { ids })
                .andWhere('product.deleted_at IS NULL')
                .getMany();

            return ProductMapper.toDomainList(ormList);
        } catch (error) {
            throw this.handleError(error, 'findByIds');
        }
    }

    /**
     * Find all products with optional filters
     */
    async findAll(options?: FindProductOptions): Promise<Product[]> {
        try {
            const queryBuilder = this.ormRepository
                .createQueryBuilder('product')
                .where('product.deleted_at IS NULL');

            // Filters
            if (options?.category) {
                queryBuilder.andWhere('product.category = :category', {
                    category: options.category,
                });
            }

            if (options?.isActive !== undefined) {
                queryBuilder.andWhere('product.is_active = :isActive', {
                    isActive: options.isActive,
                });
            }

            // Pagination
            if (options?.limit) {
                queryBuilder.limit(options.limit);
            }

            if (options?.offset) {
                queryBuilder.offset(options.offset);
            }

            // Order by created date(newest date)
            queryBuilder.orderBy('product.created_at', 'DESC');

            const ormList = await queryBuilder.getMany();
            return ProductMapper.toDomainList(ormList);
        } catch (error) {
            throw this.handleError(error, 'findAll');
        }
    }

    /**
     * Count products with optional filters
     */
    async count(options?: FindProductOptions): Promise<number> {
        try {
            const queryBuilder = this.ormRepository
                .createQueryBuilder('product')
                .where('product.deleted_at IS NULL');

            // Filters
            if (options?.category) {
                queryBuilder.andWhere('product.category = :category', {
                    category: options.category,
                });
            }

            if (options?.isActive !== undefined) {
                queryBuilder.andWhere('product.is_active = :isActive', {
                    isActive: options.isActive,
                });
            }

            return await queryBuilder.getCount();
        } catch (error) {
            throw this.handleError(error, 'count');
        }
    }

    /**
     * Delete product that exists
     */
    async delete(id: string): Promise<void> {
        try {
            await this.ormRepository.softDelete(id);
        } catch (error) {
            throw this.handleError(error, 'delete');
        }
    }

    /**
     * Handle database errors and convert to appropriate exceptions
     */
    private handleError(error: unknown, operation: string): Error {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

        // Log error for debugging
        console.error(`ProductRepository.${operation} error:`, errorMessage);

        // Convert to domain-specific errors
        if (errorMessage.includes('duplicate key')) {
            return new Error('Product with this identifier already exists');
        }

        if (errorMessage.includes('not found')) {
            return new Error('Product not found');
        }

        // Return original error (Error)
        return error as Error;
    }
}
