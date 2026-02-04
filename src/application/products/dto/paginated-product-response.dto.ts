import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product-response.dto';

/**
 * Paginated Product Response DTO
 */
export class PaginatedProductResponseDto {
    @ApiProperty({
        description: 'Array of products',
        type: [ProductResponseDto],
    })
    data: ProductResponseDto[];

    @ApiProperty({
        description: 'Total number of products',
        example: 100,
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 10,
    })
    totalPages: number;
}
