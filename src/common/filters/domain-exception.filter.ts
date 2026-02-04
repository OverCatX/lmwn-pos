import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import {
  InvalidOrderStateException,
  InvalidDiscountException,
  OrderItemNotFoundException,
  InvalidProductException,
} from '../../domain/exceptions';

/**
 * Global Exception Filter to catch domain exceptions and convert them to HTTP responses
 * Maps domain-level exceptions to appropriate HTTP status codes
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Map domain exceptions to HTTP status codes
    const statusCode = this.getStatusCode(exception);

    response.status(statusCode).json({
      statusCode,
      timestamp: new Date().toISOString(),
      message: exception.message,
      error: exception.constructor.name,
    });
  }

  /**
   * Maps domain exception types to HTTP status codes
   * @param exception - The domain exception
   * @returns HTTP status code
   */
  private getStatusCode(exception: DomainException): number {
    // Business rule violations (400 Bad Request)
    if (
      exception instanceof InvalidOrderStateException ||
      exception instanceof InvalidDiscountException ||
      exception instanceof InvalidProductException
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    // Not found exceptions (404 Not Found)
    if (exception instanceof OrderItemNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }

    // Default to 400 Bad Request for unknown domain exceptions
    return HttpStatus.BAD_REQUEST;
  }
}
