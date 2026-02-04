import { ApiProperty } from '@nestjs/swagger';

/**
 * Product Response DTO
 */
export class ProductResponseDto {
    @ApiProperty({
        description: 'Product unique identifier',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    id: string;

    @ApiProperty({
        description: 'Product name',
        example: 'Pad Thai',
    })
    name: string;

    @ApiProperty({
        description: 'Product description',
        example: 'Thai fried noodles with shrimp, peanuts, and lime',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Product price',
        example: 120.0,
    })
    price: number;

    @ApiProperty({
        description: 'Currency code',
        example: 'THB',
        default: 'THB',
    })
    currency: string;

    @ApiProperty({
        description: 'Product category',
        example: 'Main Course',
    })
    category: string;

    @ApiProperty({
        description: 'Whether the product is active and available for sale',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Product creation timestamp',
        example: '2026-02-04T12:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Product last update timestamp',
        example: '2026-02-04T12:00:00.000Z',
    })
    updatedAt: Date;
}
