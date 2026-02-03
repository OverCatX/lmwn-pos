export class OrderNumber {
  private constructor(private readonly value: string) { }

  /**
   * Generates a new order number with format ORD-YYYY-MMDD-XXX
   * @param date - Date to use for order number (defaults to current date)
   * @returns OrderNumber value object
   */
  static generate(date: Date = new Date()): OrderNumber {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');

    const orderNumber = `ORD-${year}-${month}${day}-${random}`;
    return new OrderNumber(orderNumber);
  }

  /**
   * Creates OrderNumber from string with format validation
   * @param value - Order number string (format: ORD-YYYY-MMDD-XXX)
   * @returns OrderNumber value object
   */
  static from(value: string): OrderNumber {
    const pattern = /^ORD-\d{4}-\d{4}-\d{3}$/;
    if (!pattern.test(value)) {
      throw new Error(
        'Invalid order number format. Expected: ORD-YYYY-MMDD-XXX',
      );
    }
    return new OrderNumber(value);
  }

  /**
   * Converts OrderNumber value object to string
   * @returns The order number string
   */
  toString(): string {
    return this.value;
  }

  equals(other: OrderNumber): boolean {
    return this.value === other.value;
  }
}

