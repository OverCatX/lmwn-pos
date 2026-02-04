import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UseFilters,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrderService } from '../../../application/orders/services';
import {
    CreateOrderDto,
    OrderResponseDto,
    UpdateOrderStatusDto,
    ApplyDiscountDto,
    QueryOrdersDto,
    PaginatedOrderResponseDto,
} from '../../../application/orders/dto';
import { DomainExceptionFilter } from '../../../common/filters';
import {
    ApiCreateOrder,
    ApiGetAllOrders,
    ApiGetOrderById,
    ApiUpdateOrderStatus,
    ApiApplyDiscount,
} from '../../../common/decorators';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
@UseFilters(DomainExceptionFilter)
export class OrdersController {
    constructor(private readonly orderService: OrderService) { }

    /**
     * Create order
     * @param createOrderDto - Create order data
     * @returns Order details
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreateOrder() //Swagger decoratorr
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
    ): Promise<OrderResponseDto> {
        return await this.orderService.createOrder(createOrderDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiGetAllOrders() //Swagger decoratorr
    async getAllOrders(
        @Query() query: QueryOrdersDto,
    ): Promise<PaginatedOrderResponseDto> {
        return await this.orderService.findAll(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiGetOrderById() //Swagger decoratorr
    async getOrderById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<OrderResponseDto> {
        return await this.orderService.findById(id);
    }

    /**
     * Update order status
     * @param id - Order unique identifier
     * @param dto - Update order status data
     * @returns Order details
     */
    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @ApiUpdateOrderStatus()  //Swagger decoratorr
    async updateOrderStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateOrderStatusDto,
    ): Promise<OrderResponseDto> {
        return await this.orderService.updateOrderStatus(id, dto);
    }

    @Patch(':id/discount')
    @HttpCode(HttpStatus.OK)
    @ApiApplyDiscount()
    async applyDiscount(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ApplyDiscountDto,
    ): Promise<OrderResponseDto> {
        return await this.orderService.applyDiscount(id, dto);
    }

    @Delete(':id/discount')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove discount from order' })
    @ApiResponse({ status: 200, description: 'Discount removed successfully', type: OrderResponseDto })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async removeDiscount(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<OrderResponseDto> {
        return await this.orderService.removeDiscount(id);
    }

    /**
     * NOTE: Delete endpoint is disabled for production use.
     * 
     * Orders should never be physically deleted because:
     * - Tax authorities require complete transaction history
     * - Prevents fraud (staff hiding transactions)
     * - Cancelled orders provide business insights
     * - Legal compliance for financial records
     * 
     * Use PATCH /orders/:id/status with status "CANCELLED" instead.
     */
    // @Delete(':id')
    // @HttpCode(HttpStatus.NO_CONTENT)
    // @ApiDeleteOrder()
    // async deleteOrder(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    //     await this.orderService.delete(id);
    // }
}
