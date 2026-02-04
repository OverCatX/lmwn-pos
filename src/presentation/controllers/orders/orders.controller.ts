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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
    ApiDeleteOrder,
} from '../../../common/decorators';

@ApiTags('Orders')
@Controller('orders')
@UseFilters(DomainExceptionFilter)
export class OrdersController {
    constructor(private readonly orderService: OrderService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreateOrder() // Swagger decoratorrr
    async createOrder(
        @Body() createOrderDto: CreateOrderDto,
    ): Promise<OrderResponseDto> {
        return await this.orderService.createOrder(createOrderDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiGetAllOrders() // Swagger decoratorrr
    async getAllOrders(
        @Query() query: QueryOrdersDto,
    ): Promise<PaginatedOrderResponseDto> {
        return await this.orderService.findAll(query);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiGetOrderById() // Swagger decoratorrr
    async getOrderById(@Param('id') id: string): Promise<OrderResponseDto> {
        return await this.orderService.findById(id);
    }

    @Patch(':id/status')
    @HttpCode(HttpStatus.OK)
    @ApiUpdateOrderStatus() // Swagger decoratorrr
    async updateOrderStatus(
        @Param('id') id: string,
        @Body() dto: UpdateOrderStatusDto,
    ): Promise<OrderResponseDto> {
        return await this.orderService.updateOrderStatus(id, dto);
    }

    @Patch(':id/discount')
    @HttpCode(HttpStatus.OK)
    @ApiApplyDiscount() // Swagger decoratorrr
    async applyDiscount(
        @Param('id') id: string,
        @Body() dto: ApplyDiscountDto,
    ): Promise<OrderResponseDto> {
        return await this.orderService.applyDiscount(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiDeleteOrder() // Swagger decoratorrr
    async deleteOrder(@Param('id') id: string): Promise<void> {
        await this.orderService.delete(id);
    }
}
