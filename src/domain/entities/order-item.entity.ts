import { Money } from '../value-objects/money.vo';
import { Quantity } from '../value-objects/quantity.vo';
import { Product } from './product.entity';
import { InvalidDiscountException } from '../exceptions';

/**
 * OrderItem Entity
 * Represents an item within an order
 * Snapshot of product price at the time of order
 */
export class OrderItem {
  constructor(
    private readonly id: string,
    private readonly productId: string,
    private quantity: Quantity,
    private readonly unitPrice: Money,
    private discountAmount: Money = Money.from(0, unitPrice.getCurrency()),
  ) { }

  /**
   * Factory method to create OrderItem from Product
   * Snapshots the product price at creation time
   * @param id - OrderItem ID
   * @param product - Product entity
   * @param quantity - Quantity to order
   * @returns New OrderItem instance
   */
  static fromProduct(id: string, product: Product, quantity: number): OrderItem {
    return new OrderItem(
      id,
      product.getId(),
      Quantity.from(quantity),
      product.getPrice(),
    );
  }

  getId(): string {
    return this.id;
  }

  getProductId(): string {
    return this.productId;
  }

  getQuantity(): Quantity {
    return this.quantity;
  }

  getUnitPrice(): Money {
    return this.unitPrice;
  }

  getDiscountAmount(): Money {
    return this.discountAmount;
  }

  /**
   * Change the quantity of this order item
   * @param quantity - New quantity (must be positive)
   */
  changeQuantity(quantity: number): void {
    this.quantity = Quantity.from(quantity);
  }

  /**
   * Set discount amount for this order item
   * @param discount - Discount amount (must be non-negative and not exceed subtotal)
   * @throws InvalidDiscountException if discount is invalid
   */
  setDiscount(discount: Money): void {
    if (discount.toNumber() < 0) {
      throw InvalidDiscountException.negativeDiscount();
    }

    const subtotal = this.calculateSubtotal();
    if (discount.toNumber() > subtotal.toNumber()) {
      throw InvalidDiscountException.exceedsSubtotal(
        discount.toNumber(),
        subtotal.toNumber(),
      );
    }

    this.discountAmount = discount;
  }

  /**
   * Calculate subtotal (quantity * unit price)
   * @returns Subtotal amount
   */
  calculateSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity.toNumber());
  }

  /**
   * Calculate total (subtotal - discount)
   * @returns Total amount after discount
   */
  calculateTotal(): Money {
    const subtotal = this.calculateSubtotal();

    if (this.discountAmount.toNumber() === 0) {
      return subtotal;
    }

    return subtotal.subtract(this.discountAmount);
  }
}

