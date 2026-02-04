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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../../../domain/discount';

/**
 * Apply Discount DTO
 * Used when applying discount to an order
 * Supports both pre-defined discounts (via discountId/code) and manual discounts
 */
export class ApplyDiscountDto {
  @ApiPropertyOptional({
    description: 'Pre-defined discount ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Discount ID must be a valid UUID' })
  discountId?: string;

  @ApiPropertyOptional({
    description: 'Pre-defined discount code',
    example: 'SAVE10',
  })
  @IsOptional()
  @IsString()
  discountCode?: string;

  @ApiProperty({
    description: 'Type of discount',
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    enumName: 'DiscountType',
  })
  @IsEnum(DiscountType, {
    message: `Discount type must be one of: ${Object.values(DiscountType).join(', ')}`,
  })
  discountType: DiscountType;

  @ApiProperty({
    description: 'Discount value (percentage 0-100 or fixed amount)',
    example: 10,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Discount value must be a number' })
  @Min(0, { message: 'Discount value must be non-negative' })
  @ValidateIf((o: ApplyDiscountDto) => o.discountType === DiscountType.PERCENTAGE)
  @Max(100, { message: 'Percentage discount cannot exceed 100%' })
  discountValue: number;

  @ApiPropertyOptional({
    description: 'Maximum discount amount (only for percentage discounts)',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max discount must be a number' })
  @Min(0, { message: 'Max discount must be non-negative' })
  maxDiscount?: number;
}
