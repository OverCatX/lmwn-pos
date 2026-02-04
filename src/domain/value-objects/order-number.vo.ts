/**
 * OrderNumber Value Object
 * Format: ORD-YYYY-MMDD-XXX (e.g., ORD-2026-0204-001)
 */
export class OrderNumber {
  private constructor(private readonly value: string) { }

  static generate(date: Date = new Date()): OrderNumber {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    const orderNumber = `ORD-${year}-${month}${day}-${random}`;
    return new OrderNumber(orderNumber);
  }

  static from(value: string): OrderNumber {
    const pattern = /^ORD-\d{4}-\d{4}-\d{3}$/;
    if (!pattern.test(value)) {
      throw new Error(
        'Invalid order number format. Expected: ORD-YYYY-MMDD-XXX',
      );
    }
    return new OrderNumber(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: OrderNumber): boolean {
    return this.value === other.value;
  }
}
