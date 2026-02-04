import { Money } from '../value-objects/money.vo';
import { Quantity } from '../value-objects/quantity.vo';
import { Product } from './product.entity';
import { InvalidDiscountException } from '../exceptions';

/**
 * OrderItem Entity - Snapshots product price at time of order
 */
export class OrderItem {
  constructor(
    private readonly id: string,
    private readonly productId: string,
    private quantity: Quantity,
    private readonly unitPrice: Money,
    private discountAmount: Money = Money.from(0, unitPrice.getCurrency()),
  ) { }

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

  changeQuantity(quantity: number): void {
    this.quantity = Quantity.from(quantity);
  }

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

  calculateSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity.toNumber());
  }

  calculateTotal(): Money {
    const subtotal = this.calculateSubtotal();

    if (this.discountAmount.toNumber() === 0) {
      return subtotal;
    }

    return subtotal.subtract(this.discountAmount);
  }
}
