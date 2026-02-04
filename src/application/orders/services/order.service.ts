import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { Order } from '../../../domain/order';
import { Money } from '../../../domain/shared';
import { OrderNumber } from '../../../domain/order';
import { IOrderRepository } from '../../../domain/order';
import { IProductRepository } from '../../../domain/product';
import {
  CreateOrderDto,
  OrderResponseDto,
  UpdateOrderStatusDto,
  ApplyDiscountDto,
  QueryOrdersDto,
  PaginatedOrderResponseDto,
} from '../dto';
import { OrderDtoMapper } from '../mappers';
import {
  InvalidOrderStateException,
  OrderItemNotFoundException,
  InvalidOrderStateTransitionException,
} from '../../../domain/order';
import { InvalidDiscountException, DiscountCalculator } from '../../../domain/discount';
import { OrderStateMachine } from '../../../domain/order';

@Injectable()
export class OrderService {
  private readonly discountCalculator: DiscountCalculator;
  private readonly orderStateMachine: OrderStateMachine;

  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {
    this.discountCalculator = new DiscountCalculator();
    this.orderStateMachine = new OrderStateMachine();
  }

  async createOrder(dto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
      const productIds = dto.items.map((item) => item.productId);
      const products = await this.productRepository.findByIds(productIds);

      if (products.length !== productIds.length) { // Check if all products are found
        const foundIds = products.map((p) => p.getId()); // Get found IDs
        const missingIds = productIds.filter((id) => !foundIds.includes(id)); // Get missing IDs
        throw new BadRequestException(`Products not found: ${missingIds.join(', ')}`);
      }

      const inactiveProducts = products.filter((p) => !p.getIsActive()); // Check if products are inactive
      if (inactiveProducts.length > 0) {
        const inactiveNames = inactiveProducts.map((p) => p.getName()); // Get inactive product names
        throw new BadRequestException(`Products are inactive: ${inactiveNames.join(', ')}`);
      }

      const orderId = this.generateUuid();
      const order = Order.create(orderId, dto.createdBy);

      for (const itemDto of dto.items) {
        const product = products.find((p) => p.getId() === itemDto.productId); // Find product by ID
        if (!product) { // check if product is founddd
          throw new BadRequestException(`Product not found: ${itemDto.productId}`);
        }

        order.addItem(product, itemDto.quantity); // Add item to order
      }

      const savedOrder = await this.orderRepository.save(order); // Save order
      return OrderDtoMapper.toResponseDto(savedOrder);
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  /**
   * Update order status with state machine validation
   * @param id - Order ID
   * @param dto - Update status DTO
   * @returns Updated order
   */
  async updateOrderStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    try {
      const order = await this.findOrderById(id);

      // Validate state transition using OrderStateMachine
      this.orderStateMachine.validateTransition(order, dto.status);

      // Update status
      order.updateStatus(dto.status);

      // TODO: Log state change for audit trail (reason included if provided)
      if (dto.reason) {
        console.log(`Order ${id} status changed to ${dto.status}. Reason: ${dto.reason}`);
      }

      const updated = await this.orderRepository.update(order);
      return OrderDtoMapper.toResponseDto(updated);
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  /**
   * Apply discount to order using DiscountCalculator
   * @param id - Order ID
   * @param dto - Apply discount DTO
   * @returns Updated order
   */
  async applyDiscount(
    id: string,
    dto: ApplyDiscountDto,
  ): Promise<OrderResponseDto> {
    try {
      const order = await this.findOrderById(id);
      const subtotal = order.getSubtotal();

      // Calculate discount using DiscountCalculator
      let discountAmount: Money;

      if (dto.discountType === 'PERCENTAGE') {
        const maxDiscount = dto.maxDiscount
          ? Money.from(dto.maxDiscount, subtotal.getCurrency())
          : undefined;

        discountAmount = this.discountCalculator.calculatePercentageDiscount(
          subtotal,
          dto.discountValue,
          maxDiscount,
        );
      } else if (dto.discountType === 'FIXED_AMOUNT') {
        const fixedAmount = Money.from(dto.discountValue, subtotal.getCurrency());
        discountAmount = this.discountCalculator.calculateFixedDiscount(
          subtotal,
          fixedAmount,
        );
      } else {
        throw new BadRequestException(`Unsupported discount type: ${dto.discountType}`);
      }

      // Apply calculated discount to order
      order.applyDiscount(discountAmount);

      // TODO: Log discount application for audit trail
      console.log(
        `Applied ${dto.discountType} discount of ${dto.discountValue} to order ${id}. ` +
        `Discount amount: ${discountAmount.toNumber()}`,
      );

      const updated = await this.orderRepository.update(order);
      return OrderDtoMapper.toResponseDto(updated);
    } catch (error) {
      this.handleDomainError(error);
    }
  }

  async findById(id: string): Promise<OrderResponseDto> {
    const order = await this.findOrderById(id);
    return OrderDtoMapper.toResponseDto(order);
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderResponseDto> {
    try {
      const orderNumberVo = OrderNumber.from(orderNumber);
      const order = await this.orderRepository.findByOrderNumber(orderNumberVo);

      if (!order) {
        throw new NotFoundException(`Order not found: ${orderNumber}`);
      }

      return OrderDtoMapper.toResponseDto(order);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid order number format');
    }
  }

  async findAll(query: QueryOrdersDto): Promise<PaginatedOrderResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    const options = {
      status: query.status,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
      limit,
      offset,
    };

    const [orders, total] = await Promise.all([
      this.orderRepository.findAll(options),
      this.orderRepository.count(options),
    ]);

    return OrderDtoMapper.toPaginatedResponse(orders, total, page, limit);
  }

  async delete(id: string): Promise<void> {
    await this.findOrderById(id);
    await this.orderRepository.delete(id);
  }

  private async findOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw new NotFoundException(`Order not found: ${id}`);
    }

    return order;
  }


  /**
   * Generate a UUID
   * @returns A UUID
   */
  private generateUuid(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Handle domain errors and map to appropriate HTTP exceptions
   * @param error - The error
   * @returns A never
   */
  private handleDomainError(error: unknown): never {
    if (error instanceof InvalidOrderStateException) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof InvalidOrderStateTransitionException) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof InvalidDiscountException) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof OrderItemNotFoundException) {
      throw new NotFoundException(error.message);
    }

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    if (error instanceof Error) {
      console.error('OrderService error:', error.message, error.stack);
      throw new BadRequestException(error.message);
    }

    console.error('OrderService unknown error:', error);
    throw new BadRequestException('An unknown error occurred while processing the order');
  }
}
