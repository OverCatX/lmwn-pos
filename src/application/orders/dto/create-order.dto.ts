import {
    IsNotEmpty,
    IsArray,
    ArrayMinSize,
    ValidateNested,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

/**
 * Create Order DTO
 * Used when creating a new order
 */
export class CreateOrderDto {
    @IsNotEmpty({ message: 'Items cannot be empty' })
    @IsArray()
    @ArrayMinSize(1, { message: 'Order must have at least 1 item' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @IsNotEmpty()
    @IsString()
    createdBy: string; // (Staff ID or name)
}
