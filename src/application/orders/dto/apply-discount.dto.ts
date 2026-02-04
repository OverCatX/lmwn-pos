import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsString,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { DiscountType } from '../../../domain/discount';

/**
 * Apply Discount DTO
 * Used when applying discount to an order
 * Supports both pre-defined discounts (via discountId/code) and manual discounts
 */
export class ApplyDiscountDto {
  @IsOptional()
  @IsUUID('4', { message: 'Discount ID must be a valid UUID' })
  discountId?: string;

  @IsOptional()
  @IsString()
  discountCode?: string;

  @IsEnum(DiscountType, {
    message: `Discount type must be one of: ${Object.values(DiscountType).join(', ')}`,
  })
  discountType: DiscountType;

  @IsNumber({}, { message: 'Discount value must be a number' })
  @Min(0, { message: 'Discount value must be non-negative' })
  @ValidateIf((o) => o.discountType === DiscountType.PERCENTAGE)
  @Max(100, { message: 'Percentage discount cannot exceed 100%' })
  discountValue: number;

  @IsOptional()
  @IsNumber({}, { message: 'Max discount must be a number' })
  @Min(0, { message: 'Max discount must be non-negative' })
  maxDiscount?: number;
}
