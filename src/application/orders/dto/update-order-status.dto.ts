import { IsNotEmpty, IsEnum } from 'class-validator';
import { OrderStatus } from '../../../domain/order';

/**
 * Update Order Status DTO
 * Used when changing order status
 */
export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus, {
    message: `Status must be one of: ${Object.values(OrderStatus).join(', ')}`,
  })
  status: OrderStatus;
}
