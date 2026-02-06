import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly logger: Logger,
    ) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody: any = {
            success: false,
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: 'Internal server error',
            errors: null
        };

        if (exception instanceof HttpException) {
            const response = exception.getResponse() as any;

            if (typeof response === 'object') {
                responseBody.message = response.message || exception.message;
                responseBody.errors = response.errors || null;
            } else {
                responseBody.message = response;
            }
        }

        if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(exception, 'Internal Server Error');
        } else {
            this.logger.warn(exception, 'Client Error');
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
