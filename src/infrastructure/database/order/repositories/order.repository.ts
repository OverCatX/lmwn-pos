import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../../../../domain/order';
import { OrderNumber } from '../../../../domain/order';
import {
  IOrderRepository,
  FindOrderOptions,
} from '../../../../domain/order';
import { OrderOrmEntity } from '../entities/order.orm.entity';
import { OrderMapper } from '../mappers/order.mapper';

/**
 * Order Repository
 * This repo using TypeORM
 * Handles operations with nested OrderItems
 */
@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly ormRepository: Repository<OrderOrmEntity>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Save a new order with items (uses transaction)
   */
  async save(order: Order): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ormEntity = OrderMapper.toOrm(order);
      // Save order with items (cascade will save items automatically)
      const saved = await queryRunner.manager.save(OrderOrmEntity, ormEntity);
      await queryRunner.commitTransaction(); // Commit transaction if success
      // Load with relations for complete mapping
      const loaded = await this.ormRepository.findOne({
        where: { id: saved.id },
        relations: ['items'],
      });

      if (!loaded) {
        throw new Error('Order not found after save');
      }

      return OrderMapper.toDomain(loaded);
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Rollback transaction if error
      throw this.handleError(error, 'save');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update an existing order
   */
  async update(order: Order): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const ormEntity = OrderMapper.toOrm(order);
      // Update order (cascade will update items)
      await queryRunner.manager.save(OrderOrmEntity, ormEntity);
      await queryRunner.commitTransaction();
      // Load updated order with relations
      const updated = await this.ormRepository.findOne({
        where: { id: order.getId() },
        relations: ['items'],
      });
      if (!updated) {
        throw new Error('Order not found after update');
      }
      return OrderMapper.toDomain(updated);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw this.handleError(error, 'update');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Find an order by ID
   */
  async findById(id: string): Promise<Order | null> {
    try {
      const orm = await this.ormRepository.findOne({
        where: { id },
        relations: ['items'],
      });
      return orm ? OrderMapper.toDomain(orm) : null;
    } catch (error) {
      throw this.handleError(error, 'findById');
    }
  }

  /**
   * Find an order by order number
   */
  async findByOrderNumber(orderNumber: OrderNumber): Promise<Order | null> {
    try {
      const orm = await this.ormRepository.findOne({
        where: { orderNumber: orderNumber.toString() },
        relations: ['items'],
      });
      return orm ? OrderMapper.toDomain(orm) : null;
    } catch (error) {
      throw this.handleError(error, 'findByOrderNumber');
    }
  }

  /**
   * Find all orders with optional filters
   */
  async findAll(options?: FindOrderOptions): Promise<Order[]> {
    try {
      const queryBuilder = this.ormRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .where('order.deleted_at IS NULL');

      // Apply filters
      if (options?.status) {
        queryBuilder.andWhere('order.status = :status', {
          status: options.status,
        });
      }

      if (options?.fromDate) {
        queryBuilder.andWhere('order.created_at >= :fromDate', {
          fromDate: options.fromDate,
        });
      }

      if (options?.toDate) {
        queryBuilder.andWhere('order.created_at <= :toDate', {
          toDate: options.toDate,
        });
      }

      // Apply pagination
      if (options?.limit) {
        queryBuilder.limit(options.limit);
      }

      if (options?.offset) {
        queryBuilder.offset(options.offset);
      }

      // Order by created date (newest first)
      queryBuilder.orderBy('order.created_at', 'DESC');

      const ormList = await queryBuilder.getMany();
      return OrderMapper.toDomainList(ormList);
    } catch (error) {
      throw this.handleError(error, 'findAll');
    }
  }

  /**
   * Count orders with optional filters
   */
  async count(options?: FindOrderOptions): Promise<number> {
    try {
      const queryBuilder = this.ormRepository
        .createQueryBuilder('order')
        .where('order.deleted_at IS NULL');

      // Apply filters
      if (options?.status) {
        queryBuilder.andWhere('order.status = :status', {
          status: options.status,
        });
      }

      if (options?.fromDate) {
        queryBuilder.andWhere('order.created_at >= :fromDate', {
          fromDate: options.fromDate,
        });
      }

      if (options?.toDate) {
        queryBuilder.andWhere('order.created_at <= :toDate', {
          toDate: options.toDate,
        });
      }

      return await queryBuilder.getCount();
    } catch (error) {
      throw this.handleError(error, 'count');
    }
  }

  /**
   * Find orders within a date range (for reports)
   */
  async findByDateRange(fromDate: Date, toDate: Date): Promise<Order[]> {
    try {
      const ormList = await this.ormRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .where('order.deleted_at IS NULL')
        .andWhere('order.created_at >= :fromDate', { fromDate })
        .andWhere('order.created_at <= :toDate', { toDate })
        .orderBy('order.created_at', 'ASC')
        .getMany();

      return OrderMapper.toDomainList(ormList);
    } catch (error) {
      throw this.handleError(error, 'findByDateRange');
    }
  }

  /**
   * Soft delete an order
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

    // Log error for debugging (in production, use proper logging service)
    console.error(`OrderRepository.${operation} error:`, errorMessage);

    // Convert to domain-specific errors if needed
    if (errorMessage.includes('duplicate key')) {
      if (errorMessage.includes('order_number')) {
        return new Error('Order number already exists');
      }
      return new Error('Order with this identifier already exists');
    }

    if (errorMessage.includes('not found')) {
      return new Error('Order not found');
    }

    if (errorMessage.includes('foreign key')) {
      return new Error('Referenced product not found');
    }

    // Return original error
    return error as Error;
  }
}
