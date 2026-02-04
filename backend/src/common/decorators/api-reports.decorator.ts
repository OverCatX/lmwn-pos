import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiQuery,
} from '@nestjs/swagger';
import {
    DailySalesSummaryDto,
    RevenueReportDto,
    ProductPerformanceDto,
} from '../../application/reports/dto';

export function ApiGetDailySummary() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get daily sales summary',
            description:
                'Returns comprehensive sales summary for a specific day including revenue, orders breakdown, and top products.',
        }),
        ApiBearerAuth(),
        ApiQuery({
            name: 'date',
            required: false,
            type: String,
            description: 'Report date (YYYY-MM-DD format). Defaults to today.',
            example: '2026-02-04',
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Daily sales summary',
            type: DailySalesSummaryDto,
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'Invalid date format',
        }),
    );
}

export function ApiGetRevenueReport() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get revenue report for date range',
            description:
                'Returns detailed revenue analysis including daily breakdown, trends, and discount usage for a specified period.',
        }),
        ApiBearerAuth(),
        ApiQuery({
            name: 'fromDate',
            required: true,
            type: String,
            description: 'Start date (YYYY-MM-DD format)',
            example: '2026-02-01',
        }),
        ApiQuery({
            name: 'toDate',
            required: true,
            type: String,
            description: 'End date (YYYY-MM-DD format)',
            example: '2026-02-07',
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Revenue report for date range',
            type: RevenueReportDto,
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'Invalid date format or date range',
        }),
    );
}

export function ApiGetProductPerformance() {
    return applyDecorators(
        ApiOperation({
            summary: 'Get product performance report',
            description:
                'Returns product sales analysis including top/bottom performers and category breakdown for a specified period.',
        }),
        ApiBearerAuth(),
        ApiQuery({
            name: 'fromDate',
            required: true,
            type: String,
            description: 'Start date (YYYY-MM-DD format)',
            example: '2026-02-01',
        }),
        ApiQuery({
            name: 'toDate',
            required: true,
            type: String,
            description: 'End date (YYYY-MM-DD format)',
            example: '2026-02-07',
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: 'Product performance report',
            type: ProductPerformanceDto,
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: 'Invalid date format or date range',
        }),
    );
}
