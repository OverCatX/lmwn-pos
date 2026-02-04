import { Product } from '../../../domain/product';
import { ProductResponseDto } from '../dto';

/**
 * Product DTO Mapper
 * Maps between Domain Entities and DTOs
 */
export class ProductDtoMapper {
    /**
     * Map Product entity to Response DTO
     */
    static toResponseDto(product: Product): ProductResponseDto {
        return {
            id: product.getId(),
            name: product.getName(),
            description: product.getDescription(),
            price: product.getPrice().toNumber(),
            currency: product.getPrice().getCurrency(),
            category: product.getCategory(),
            isActive: product.getIsActive(),
            createdAt: product.getCreatedAt(),
            updatedAt: product.getUpdatedAt(),
        };
    }

    /**
     * Map multiple Product entities to Response DTOs
     */
    static toResponseDtoArray(products: Product[]): ProductResponseDto[] {
        return products.map((product) => this.toResponseDto(product));
    }
}
