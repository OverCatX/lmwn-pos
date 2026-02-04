import { v4 as uuidv4 } from 'uuid';
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
  private static readonly TAX_RATE = 0.07;

  private readonly items: OrderItem[] = [];
  private subtotal: Money;
  private tax: Money;
  private discountAmount: Money;
  private discountAppliedAt?: Date;
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
    this.tax = Money.from(0, defaultCurrency);
    this.discountAmount = Money.from(0, defaultCurrency);
    this.total = Money.from(0, defaultCurrency);
    this.createdAt = createdAt || new Date();
    this.updatedAt = new Date();
  }

  static create(id: string, createdBy: string, date?: Date): Order {
    const orderNumber = OrderNumber.generate(date);
    return new Order(id, orderNumber, createdBy);
  }

  /**
   * Restore order from database with stored values
   * Used by ORM mapper to reconstitute order state
   */
  static restore(
    id: string,
    orderNumber: OrderNumber,
    createdBy: string,
    status: OrderStatus,
    items: OrderItem[],
    subtotal: Money,
    tax: Money,
    discountAmount: Money,
    discountAppliedAt: Date | undefined,
    total: Money,
    createdAt: Date,
    updatedAt: Date,
    completedAt?: Date,
  ): Order {
    const order = new Order(id, orderNumber, createdBy, status, createdAt);

    order.items.push(...items);
    order.subtotal = subtotal;
    order.tax = tax;
    order.discountAmount = discountAmount;
    order.discountAppliedAt = discountAppliedAt;
    order.total = total;
    order.updatedAt = updatedAt;
    if (completedAt) {
      order.completedAt = completedAt;
    }

    return order;
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

  getTax(): Money {
    return this.tax;
  }

  getDiscountAmount(): Money {
    return this.discountAmount;
  }

  getDiscountAppliedAt(): Date | undefined {
    return this.discountAppliedAt;
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

    const itemId = uuidv4();
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
    this.discountAppliedAt = new Date();
    this.calculateTotals();
    this.touch();
  }

  removeDiscount(): void {
    this.assertNotCompleted();
    this.discountAmount = Money.from(0, this.subtotal.getCurrency());
    this.discountAppliedAt = undefined;
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

    // Calculate subtotal from items
    let subtotal = Money.from(0, currency);
    for (const item of this.items) {
      subtotal = subtotal.add(item.calculateSubtotal());
    }
    this.subtotal = subtotal;

    // Calculate net amount after discount (base for tax calculation)
    const netBeforeTax = this.discountAmount.toNumber() > 0
      ? this.subtotal.subtract(this.discountAmount)
      : this.subtotal;

    // Calculate tax (7% VAT) on net amount (Thailand VAT law)
    const taxAmount = netBeforeTax.toNumber() * Order.TAX_RATE;
    this.tax = Money.from(taxAmount, currency);

    // Calculate total: (subtotal - discount) + tax
    this.total = netBeforeTax.add(this.tax);
  }
}
