import {
    Controller,
    Get,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseFilters,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProductService } from '../../../application/products/services';
import {
    ProductResponseDto,
    QueryProductsDto,
    PaginatedProductResponseDto,
} from '../../../application/products/dto';
import { DomainExceptionFilter } from '../../../common/filters';
import {
    ApiGetAllProducts,
    ApiGetProductById,
} from '../../../common/decorators';

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
@UseFilters(DomainExceptionFilter)
export class ProductsController {
    constructor(private readonly productService: ProductService) { }
    /**
     * Get all products
     * @param query - Query parameters for filtering and pagination
     * @returns Paginated list of products
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiGetAllProducts() //Swagger decoratorr
    async getAllProducts(
        @Query() query: QueryProductsDto,
    ): Promise<PaginatedProductResponseDto> {
        return await this.productService.findAll(query);
    }

    /**
     * Get product by ID
     * @param id - Product unique identifier
     * @returns Product details
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiGetProductById() //Swagger decoratorr
    async getProductById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<ProductResponseDto> {
        return await this.productService.findById(id);
    }
}
