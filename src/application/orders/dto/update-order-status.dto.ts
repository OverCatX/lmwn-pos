import { IsNotEmpty, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../domain/order';

/**
 * Update Order Status DTO
 * Used when changing order status
 * Requires reason when cancelling an order
 */
export class UpdateOrderStatusDto {
  @ApiProperty({
    description: 'New order status',
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    enumName: 'OrderStatus',
  })
  @IsNotEmpty()
  @IsEnum(OrderStatus, {
    message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change (required when cancelling)',
    example: 'Customer requested cancellation',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o: UpdateOrderStatusDto) => o.status === OrderStatus.CANCELLED)
  @IsNotEmpty({ message: 'Reason is required when cancelling an order' })
  reason?: string;
}
