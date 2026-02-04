import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class QueryDailySummaryDto {
    @ApiPropertyOptional({
        description: 'Report date (YYYY-MM-DD format). Defaults to today.',
        example: '2026-02-04',
    })
    @IsOptional()
    @IsDateString({}, { message: 'Date must be in YYYY-MM-DD format' })
    date?: string;
}

export class QueryDateRangeDto {
    @ApiProperty({
        description: 'Start date (YYYY-MM-DD format)',
        example: '2026-02-01',
    })
    @IsDateString({}, { message: 'From date must be in YYYY-MM-DD format' })
    fromDate: string;

    @ApiProperty({
        description: 'End date (YYYY-MM-DD format)',
        example: '2026-02-07',
    })
    @IsDateString({}, { message: 'To date must be in YYYY-MM-DD format' })
    toDate: string;
}
