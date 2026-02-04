import {
    Controller,
    Get,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from '../../../application/products/services';
import {
    ProductResponseDto,
    QueryProductsDto,
    PaginatedProductResponseDto,
} from '../../../application/products/dto';
import {
    ApiGetAllProducts,
    ApiGetProductById,
} from 'src/common/decorators';

/**
 * Products Controller
 * Handles product-related HTTP requests
 */
@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductService) { }

    /**
     * Get all products with optional filtering and pagination
     * @param query - Query parameters for filtering and pagination
     * @returns Paginated list of products
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiGetAllProducts()
    async getAllProducts(
        @Query() query: QueryProductsDto,
    ): Promise<PaginatedProductResponseDto> {
        return await this.productService.findAll(query);
    }

    /**
     * Get a single product by ID
     * @param id - Product unique identifier
     * @returns Product details
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiGetProductById()
    async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
        return await this.productService.findById(id);
    }
}
