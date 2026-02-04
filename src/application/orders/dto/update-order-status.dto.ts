import { IsNotEmpty, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { OrderStatus } from '../../../domain/order';

/**
 * Update Order Status DTO
 * Used when changing order status
 * Requires reason when cancelling an order
 */
export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus, {
    message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.status === OrderStatus.CANCELLED)
  @IsNotEmpty({ message: 'Reason is required when cancelling an order' })
  reason?: string;
}
