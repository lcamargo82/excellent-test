import { Test, TestingModule } from '@nestjs/testing';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';

const mockHttpAdapterHost = {
    httpAdapter: {
        getRequestUrl: jest.fn().mockReturnValue('/test-url'),
        reply: jest.fn(),
    },
};

const mockLogger = {
    error: jest.fn(),
    warn: jest.fn(),
};

describe('AllExceptionsFilter', () => {
    let filter: AllExceptionsFilter;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AllExceptionsFilter,
                {
                    provide: HttpAdapterHost,
                    useValue: mockHttpAdapterHost,
                },
                {
                    provide: Logger,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    describe('catch', () => {
        let mockArgumentsHost: ArgumentsHost;
        let mockGetRequest: jest.Mock;
        let mockGetResponse: jest.Mock;

        beforeEach(() => {
            mockGetRequest = jest.fn().mockReturnValue({ url: '/test-url' });
            mockGetResponse = jest.fn().mockReturnValue({});
            mockArgumentsHost = {
                switchToHttp: jest.fn().mockReturnValue({
                    getRequest: mockGetRequest,
                    getResponse: mockGetResponse,
                }),
            } as any;
        });

        it('should catch HttpException and log warning', () => {
            const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
            filter.catch(exception, mockArgumentsHost);

            expect(mockLogger.warn).toHaveBeenCalledWith(exception, 'Client Error');
            expect(mockHttpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
                {},
                expect.objectContaining({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'Forbidden',
                }),
                HttpStatus.FORBIDDEN,
            );
        });

        it('should catch unknown exception and log error as Internal Server Error', () => {
            const exception = new Error('Random error');
            filter.catch(exception, mockArgumentsHost);

            expect(mockLogger.error).toHaveBeenCalledWith(exception, 'Internal Server Error');
            expect(mockHttpAdapterHost.httpAdapter.reply).toHaveBeenCalledWith(
                {},
                expect.objectContaining({
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Internal server error',
                }),
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        });
    });
});
