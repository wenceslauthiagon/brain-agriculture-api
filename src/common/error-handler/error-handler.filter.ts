import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorHandlerService } from './error-handler.service';

@Catch()
export class ErrorHandlerFilter implements ExceptionFilter {
  constructor(private readonly errorHandlerService: ErrorHandlerService) {}

  catch(error: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const errorResponse = this.errorHandlerService.handle(error, request.url);

    response.status(errorResponse.status_code).json(errorResponse);
  }
}
