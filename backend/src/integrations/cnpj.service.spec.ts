import { Test, TestingModule } from '@nestjs/testing';
import { CnpjService } from './cnpj.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { HttpException } from '@nestjs/common';

describe('CnpjService', () => {
    let service: CnpjService;
    let httpService: HttpService;

    const mockHttpService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CnpjService,
                {
                    provide: HttpService,
                    useValue: mockHttpService,
                },
            ],
        }).compile();

        service = module.get<CnpjService>(CnpjService);
        httpService = module.get<HttpService>(HttpService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('consultCnpj', () => {
        it('should return CNPJ data on success', async () => {
            const cnpj = '00000000000191';
            const mockResponse = {
                data: {
                    cnpj: '00.000.000/0001-91',
                    razao_social: 'BANCO DO BRASIL SA',
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: { headers: {} } as any,
            };

            mockHttpService.get.mockReturnValue(of(mockResponse));

            const result = await service.consultCnpj(cnpj);

            expect(result).toEqual(mockResponse.data);
            expect(httpService.get).toHaveBeenCalledWith(`https://publica.cnpj.ws/cnpj/${cnpj}`);
        });

        it('should throw HttpException for invalid CNPJ length', async () => {
            await expect(service.consultCnpj('123')).rejects.toThrow(HttpException);
        });

        it('should throw HttpException on API error', async () => {
            const cnpj = '00000000000191';
            const errorResponse = {
                response: {
                    status: 404,
                    data: {
                        detalhes: 'CNPJ not found',
                    },
                },
            };

            mockHttpService.get.mockReturnValue(throwError(() => errorResponse));

            await expect(service.consultCnpj(cnpj)).rejects.toThrow(HttpException);
        });

        it('should throw HttpException with default message on unknown error', async () => {
            const cnpj = '00000000000191';
            mockHttpService.get.mockReturnValue(throwError(() => new Error('Network Error')));

            await expect(service.consultCnpj(cnpj)).rejects.toThrow('Falha ao consultar CNPJ');
        });
    });
});
