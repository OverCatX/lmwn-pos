import { IsNotEmpty, IsNumber, Min } from 'class-validator';

/**
 * Apply Discount DTO
 * Used when applying discount to an order
 */
export class ApplyDiscountDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Discount amount must be non-negative' })
  discountAmount: number;
}
