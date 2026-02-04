import Decimal from 'decimal.js';

type DecimalInstance = ReturnType<typeof Decimal>;

export class Money {
  private constructor(
    private readonly amount: DecimalInstance,
    private readonly currency: string = 'THB',
  ) { }

  /**
   * Using factory method to create Money instance 
   * because it is a value object and we need to validate the amount and currency
   * @param amount - The amount of money
   * @param currency - The currency of the money
   * @returns A new Money instance
   */
  static from(amount: number | string, currency = 'THB'): Money {
    try {
      const decimal = new Decimal(amount);

      if (decimal.isNaN()) {
        throw new Error('Money amount must be a valid number');
      }

      if (decimal.isNegative()) {
        throw new Error('Money amount cannot be negative');
      }

      const rounded = decimal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      return new Money(rounded, currency);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid money amount: ${error.message}`);
      }
      throw error;
    }
  }

  getCurrency(): string {
    return this.currency;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amount.plus(other.amount);
    return new Money(result.toDecimalPlaces(2, Decimal.ROUND_HALF_UP), this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = this.amount.minus(other.amount);

    if (result.isNegative()) {
      throw new Error('Subtraction result cannot be negative');
    }

    return new Money(result.toDecimalPlaces(2, Decimal.ROUND_HALF_UP), this.currency);
  }

  multiply(factor: number): Money {
    if (factor < 0) {
      throw new Error('Multiplication factor cannot be negative');
    }

    const result = this.amount.times(factor);
    return new Money(result.toDecimalPlaces(2, Decimal.ROUND_HALF_UP), this.currency);
  }

  toNumber(): number {
    return this.amount.toNumber();
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount.equals(other.amount);
  }

  greaterThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount.greaterThan(other.amount);
  }

  lessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount.lessThan(other.amount);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: Cannot operate on ${this.currency} and ${other.currency}`,
      );
    }
  }
}
