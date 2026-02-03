export class Money {
  private constructor(
    private readonly amount: number,
    private readonly currency: string = 'THB',
  ) { }

  // Factory Method use for creates a Money VO.(Value Object) with normalization and validation 
  // Use instead of calling constructor directly
  static from(amount: number | string, currency = 'THB'): Money {
    const numericAmount = typeof amount === 'string' ? Number(amount) : amount;

    if (Number.isNaN(numericAmount)) {
      throw new Error('Money amount must be a valid number');
    }

    if (numericAmount < 0) {
      throw new Error('Money amount cannot be negative');
    }

    return new Money(Number(numericAmount.toFixed(2)), currency);
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other); // Check match currency
    const result = this.amount + other.amount;
    return new Money(Number(result.toFixed(2)), this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other); // Check match currency
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new Error('Result cannot be negative');
    }
    return new Money(Number(result.toFixed(2)), this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Factor cannot be negative');
    }
    const result = this.amount * factor;
    return new Money(Number(result.toFixed(2)), this.currency);
  }

  /**
   * Converts Money value object to primitive number
   * Use this for calculations, comparisons, or when primitive type is needed
   * @returns The numeric amount value
   */
  toNumber(): number {
    return this.amount;
  }

  /**
   * Converts Money to string representation
   * @returns String in format "amount CURRENCY" "100.00 THB"
   */
  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount === other.amount;
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error('Currency mismatch');
    }
  }
}
