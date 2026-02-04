import { Money } from '../../shared/value-objects/money.vo';
import { InvalidProductException } from '../exceptions/invalid-product.exception';

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

  activate(): void {
    this.isActive = true;
    this.touch();
  }

  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  changePrice(newPrice: Money): void {
    if (newPrice.toNumber() < 0) {
      throw InvalidProductException.negativePrice(newPrice.toNumber());
    }
    this.price = newPrice;
    this.touch();
  }

  rename(newName: string): void {
    if (!newName?.trim()) {
      throw InvalidProductException.emptyName();
    }
    this.name = newName.trim();
    this.touch();
  }

  changeCategory(newCategory: string): void {
    this.category = newCategory;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}
