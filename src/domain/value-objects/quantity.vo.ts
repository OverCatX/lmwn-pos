export class Quantity {
  private constructor(private readonly value: number) { }

  /**
   * Factory method creates a Quantity VO with validation
   * @param value - Must be a positive integer
   * @returns Quantity value object
   */
  static from(value: number): Quantity {
    if (!Number.isInteger(value)) {
      throw new Error('Quantity must be an integer');
    }

    if (value <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    return new Quantity(value);
  }

  /**
   * Converts Quantity value object to primitive number
   * Use this for calculations or when primitive type is needed
   * @returns The numeric quantity value
   */
  toNumber(): number {
    return this.value;
  }

  /**
   * Converts Quantity to string representation
   * @returns String representation of quantity
   */
  toString(): string {
    return this.value.toString();
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  subtract(other: Quantity): Quantity {
    const result = this.value - other.value;
    if (result <= 0) {
      throw new Error('Result must be greater than zero');
    }
    return new Quantity(result);
  }

  multiply(factor: number): Quantity {
    if (factor <= 0) {
      throw new Error('Factor must be greater than zero');
    }
    return Quantity.from(Math.floor(this.value * factor));
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  greaterThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  lessThan(other: Quantity): boolean {
    return this.value < other.value;
  }
}

