import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query Products DTO
 * For filtering and paginating products
 */
export class QueryProductsDto {
    @ApiPropertyOptional({
        description: 'Filter by product category',
        example: 'Main Course',
    })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional({
        description: 'Filter by active status',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isActive?: boolean;

    @ApiPropertyOptional({
        description: 'Search by product name',
        example: 'Pad Thai',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Page number (starts from 1)',
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        default: 10,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;
}
