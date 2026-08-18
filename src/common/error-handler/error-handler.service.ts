import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HTTP_STATUS_LABELS } from '../constants/http-status.constants';
import { ERROR_MESSAGES } from '../constants/messages/error-messages.constants';

export type ErrorResponse = {
  status_code: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
};

@Injectable()
export class ErrorHandlerService {
  handle(error: unknown, path: string): ErrorResponse {
    const statusCode = this.extractStatusCode(error);
    const message = this.extractMessage(error, statusCode);

    return {
      status_code: statusCode,
      error: this.getHttpStatusLabel(statusCode),
      message,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  private extractStatusCode(error: unknown): number {
    if (error instanceof HttpException) {
      return error.getStatus();
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private extractMessage(error: unknown, statusCode: number): string {
    if (error instanceof HttpException) {
      const response = error.getResponse();

      if (typeof response === 'object' && response !== null) {
        const message = (response as { message?: unknown }).message;
        if (Array.isArray(message)) return message.join(', ');
        if (typeof message === 'string') return message;
      }

      return error.message;
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return ERROR_MESSAGES.DATABASE_CONNECTION_UNAVAILABLE;
    }

    if (statusCode >= 500) {
      return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
    }

    return error instanceof Error
      ? error.message
      : ERROR_MESSAGES.AN_UNEXPECTED_ERROR_OCCURRED;
  }

  private getHttpStatusLabel(statusCode: number): string {
    const label = HTTP_STATUS_LABELS[statusCode];

    if (typeof label === 'string') {
      return label;
    }

    return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  }
}
