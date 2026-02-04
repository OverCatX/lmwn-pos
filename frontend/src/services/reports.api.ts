import { apiClient } from './api';
import type {
    DailySalesSummary,
    RevenueReport,
    ProductPerformanceReport,
} from '../types/report.types';

/**
 * Reports API Service
 * Handles all report-related API calls
 */
export class ReportsApi {
    private static readonly BASE_PATH = '/reports';

    /**
     * Get daily sales summary
     */
    static async getDailySalesSummary(date?: string): Promise<DailySalesSummary> {
        const params = date ? `?date=${date}` : '';
        const response = await apiClient.get<DailySalesSummary>(
            `${this.BASE_PATH}/daily-sales${params}`
        );
        return response.data;
    }

    /**
     * Get revenue report for date range
     */
    static async getRevenueReport(
        fromDate: string,
        toDate: string
    ): Promise<RevenueReport> {
        const params = new URLSearchParams({
            fromDate,
            toDate,
        });

        const response = await apiClient.get<RevenueReport>(
            `${this.BASE_PATH}/revenue?${params.toString()}`
        );
        return response.data;
    }

    /**
     * Get product performance report
     */
    static async getProductPerformanceReport(
        fromDate: string,
        toDate: string,
        limit?: number
    ): Promise<ProductPerformanceReport> {
        const params = new URLSearchParams({
            fromDate,
            toDate,
        });

        if (limit) {
            params.append('limit', limit.toString());
        }

        const response = await apiClient.get<ProductPerformanceReport>(
            `${this.BASE_PATH}/product-performance?${params.toString()}`
        );
        return response.data;
    }
}
