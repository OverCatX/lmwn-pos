import { Money } from '../../shared/value-objects/money.vo';
import { OrderNumber } from '../value-objects/order-number.vo';
import { OrderStatus } from '../enums/order-status.enum';
import { Product } from '../../product/entities/product.entity';
import { OrderItem } from './order-item.entity';
import { InvalidOrderStateException } from '../exceptions';
import { InvalidDiscountException } from '../../discount/exceptions/invalid-discount.exception';
import { OrderItemNotFoundException } from '../exceptions/order-item-not-found.exception';

/**
 * Order Entity (Aggregate Root)
 * Manages order lifecycle with state machine validation
 */
export class Order {
  private readonly items: OrderItem[] = [];
  private subtotal: Money;
  private discountAmount: Money;
  private total: Money;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private completedAt?: Date;

  // State machine: PENDING → CONFIRMED → PREPARING → READY → COMPLETED
  private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  constructor(
    private readonly id: string,
    private readonly orderNumber: OrderNumber,
    private readonly createdBy: string,
    private status: OrderStatus = OrderStatus.PENDING,
    createdAt?: Date,
  ) {
    const defaultCurrency = 'THB';
    this.subtotal = Money.from(0, defaultCurrency);
    this.discountAmount = Money.from(0, defaultCurrency);
    this.total = Money.from(0, defaultCurrency);
    this.createdAt = createdAt || new Date();
    this.updatedAt = new Date();
  }

  static create(id: string, createdBy: string, date?: Date): Order {
    const orderNumber = OrderNumber.generate(date);
    return new Order(id, orderNumber, createdBy);
  }

  getId(): string {
    return this.id;
  }

  getOrderNumber(): OrderNumber {
    return this.orderNumber;
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getItems(): OrderItem[] {
    return [...this.items];
  }

  getSubtotal(): Money {
    return this.subtotal;
  }

  getDiscountAmount(): Money {
    return this.discountAmount;
  }

  getTotal(): Money {
    return this.total;
  }

  getCreatedBy(): string {
    return this.createdBy;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getCompletedAt(): Date | undefined {
    return this.completedAt;
  }

  addItem(product: Product, quantity: number): void {
    this.assertNotCompleted();

    const itemId = `item-${this.items.length + 1}`;
    const item = OrderItem.fromProduct(itemId, product, quantity);
    this.items.push(item);
    this.calculateTotals();
    this.touch();
  }

  removeItem(itemId: string): void {
    this.assertNotCompleted();

    const index = this.items.findIndex((item) => item.getId() === itemId);
    if (index === -1) {
      throw new OrderItemNotFoundException(itemId);
    }
    this.items.splice(index, 1);
    this.calculateTotals();
    this.touch();
  }

  updateStatus(newStatus: OrderStatus): void {
    if (!this.isValidTransition(newStatus)) {
      throw InvalidOrderStateException.invalidTransition(this.status, newStatus);
    }

    this.status = newStatus;

    if (newStatus === OrderStatus.COMPLETED) {
      this.completedAt = new Date();
    }

    this.touch();
  }

  applyDiscount(discount: Money): void {
    this.assertNotCompleted();

    if (discount.toNumber() < 0) {
      throw InvalidDiscountException.negativeDiscount();
    }

    if (discount.toNumber() > this.subtotal.toNumber()) {
      throw InvalidDiscountException.exceedsSubtotal(
        discount.toNumber(),
        this.subtotal.toNumber(),
      );
    }

    this.discountAmount = discount;
    this.calculateTotals();
    this.touch();
  }

  private isValidTransition(newStatus: OrderStatus): boolean {
    const allowedTransitions = Order.VALID_TRANSITIONS[this.status] || [];
    return allowedTransitions.includes(newStatus);
  }

  private assertNotCompleted(): void {
    if (this.status === OrderStatus.COMPLETED) {
      throw InvalidOrderStateException.cannotModifyCompleted();
    }
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  calculateTotals(): void {
    const currency = this.items[0]?.getUnitPrice().getCurrency() ?? this.subtotal.getCurrency();

    let subtotal = Money.from(0, currency);
    for (const item of this.items) {
      subtotal = subtotal.add(item.calculateSubtotal());
    }

    this.subtotal = subtotal;

    if (this.discountAmount.toNumber() === 0) {
      this.total = this.subtotal;
    } else {
      this.total = this.subtotal.subtract(this.discountAmount);
    }
  }
}
