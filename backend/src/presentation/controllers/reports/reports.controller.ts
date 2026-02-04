import {
    Controller,
    Get,
    Query,
    HttpCode,
    HttpStatus,
    UseFilters,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from '../../../application/reports/services';
import {
    DailySalesSummaryDto,
    RevenueReportDto,
    ProductPerformanceDto,
    QueryDailySummaryDto,
    QueryDateRangeDto,
} from '../../../application/reports/dto';
import { DomainExceptionFilter } from '../../../common/filters';
import {
    ApiGetDailySummary,
    ApiGetRevenueReport,
    ApiGetProductPerformance,
} from '../../../common/decorators';

@ApiTags('Reports')
@Controller({ path: 'reports', version: '1' })
@UseFilters(DomainExceptionFilter)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    /**
     * Get daily sales summary
     * @param query - Query parameters (optional date)
     * @returns Daily sales summary with revenue, orders, and top products
     */
    @Get('daily-summary')
    @HttpCode(HttpStatus.OK)
    @ApiGetDailySummary()
    async getDailySummary(
        @Query() query: QueryDailySummaryDto,
    ): Promise<DailySalesSummaryDto> {
        return await this.reportsService.getDailySalesSummary(query.date);
    }

    /**
     * Get revenue report for date range
     * @param query - Query parameters (fromDate, toDate)
     * @returns Revenue report with daily breakdown and discount usage
     */
    @Get('revenue')
    @HttpCode(HttpStatus.OK)
    @ApiGetRevenueReport()
    async getRevenueReport(
        @Query() query: QueryDateRangeDto,
    ): Promise<RevenueReportDto> {
        return await this.reportsService.getRevenueReport(
            query.fromDate,
            query.toDate,
        );
    }

    /**
     * Get product performance report
     * @param query - Query parameters (fromDate, toDate)
     * @returns Product performance with top/bottom products and category breakdown
     */
    @Get('products')
    @HttpCode(HttpStatus.OK)
    @ApiGetProductPerformance()
    async getProductPerformance(
        @Query() query: QueryDateRangeDto,
    ): Promise<ProductPerformanceDto> {
        return await this.reportsService.getProductPerformanceReport(
            query.fromDate,
            query.toDate,
        );
    }
}
