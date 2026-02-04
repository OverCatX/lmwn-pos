import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and formats them consistently
 * Works alongside DomainExceptionFilter for complete error handling
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // Format error response
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: this.extractMessage(exceptionResponse),
            error: this.extractError(exceptionResponse, status),
        };

        // Log error for debugging (in production, use proper logging service)
        if (status >= 500) {
            console.error('HTTP Exception:', errorResponse);
        }

        response.status(status).json(errorResponse);
    }

    /**
     * Extract message from exception response
     */
    private extractMessage(exceptionResponse: string | object): string | string[] {
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse;
        }

        if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
            const message = (exceptionResponse as Record<string, unknown>).message;
            if (typeof message === 'string' || Array.isArray(message)) {
                return message as string | string[];
            }
        }

        return 'An error occurred';
    }

    /**
     * Extract error name from exception response
     */
    private extractError(exceptionResponse: string | object, status: number): string {
        if (typeof exceptionResponse === 'object' && 'error' in exceptionResponse) {
            const error = (exceptionResponse as Record<string, unknown>).error;
            if (typeof error === 'string') {
                return error;
            }
        }

        // Default error names based on status code
        switch (status as HttpStatus) {
            case HttpStatus.BAD_REQUEST:
                return 'Bad Request';
            case HttpStatus.UNAUTHORIZED:
                return 'Unauthorized';
            case HttpStatus.FORBIDDEN:
                return 'Forbidden';
            case HttpStatus.NOT_FOUND:
                return 'Not Found';
            case HttpStatus.CONFLICT:
                return 'Conflict';
            case HttpStatus.INTERNAL_SERVER_ERROR:
                return 'Internal Server Error';
            default:
                return 'Error';
        }
    }
}
