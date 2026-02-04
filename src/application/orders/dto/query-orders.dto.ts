import { IsOptional, IsEnum, IsInt, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../../domain/enums/order-status.enum';

/**
 * Query Orders DTO
 * Used for filtering and pagination when fetching orders
 */
export class QueryOrdersDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsDateString()
  fromDate?: string; // ISO 8601 format

  @IsOptional()
  @IsDateString()
  toDate?: string; // ISO 8601 format

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
