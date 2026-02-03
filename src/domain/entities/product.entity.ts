import { Money } from '../value-objects/money.vo';
import { InvalidProductException } from '../exceptions';

//Product Entity
export class Product {
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(
    private readonly id: string,
    private name: string,
    private price: Money,
    private category: string,
    private isActive: boolean = true,
    createdAt?: Date,
  ) {
    // Validation
    if (!name?.trim()) {
      throw InvalidProductException.emptyName();
    }
    if (price.toNumber() < 0) {
      throw InvalidProductException.negativePrice(price.toNumber());
    }

    this.name = name.trim();
    this.createdAt = createdAt || new Date();
    this.updatedAt = new Date();
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getPrice(): Money {
    return this.price;
  }

  getCategory(): string {
    return this.category;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  /**
   * Activate product (make it available for sale)
   */
  activate(): void {
    this.isActive = true;
    this.touch();
  }

  /**
   * Deactivate product (make it unavailable for sale)
   */
  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  /**
   * Change product price
   * @param newPrice - New price (must be non-negative)
   * @throws InvalidProductException if price is negative
   */
  changePrice(newPrice: Money): void {
    if (newPrice.toNumber() < 0) {
      throw InvalidProductException.negativePrice(newPrice.toNumber());
    }
    this.price = newPrice;
    this.touch();
  }

  /**
   * Rename product
   * @param newName - New name (can't empty)
   * @throws InvalidProductException if name is empty
   */
  rename(newName: string): void {
    if (!newName?.trim()) {
      throw InvalidProductException.emptyName();
    }
    this.name = newName.trim();
    this.touch();
  }

  /**
   * Change product category
   * @param newCategory - New category
   */
  changeCategory(newCategory: string): void {
    this.category = newCategory;
    this.touch();
  }

  /**
   * Update the updatedAt timestamp
   */
  private touch(): void {
    this.updatedAt = new Date();
  }
}

