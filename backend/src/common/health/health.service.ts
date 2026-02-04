import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
    ) { }

    async checkDatabase(): Promise<{ status: string; message: string }> {
        try {
            const isInitialized = this.dataSource.isInitialized;
            if (!isInitialized) {
                return {
                    status: 'error',
                    message: 'Database is not initialized',
                };
            }

            // Test query
            await this.dataSource.query('SELECT 1');
            return {
                status: 'success',
                message: 'Database connection is healthy',
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 'error',
                message: `Database connection failed: ${errorMessage}`,
            };
        }
    }
}
