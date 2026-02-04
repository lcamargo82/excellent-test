import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CnpjService {
    constructor(private readonly httpService: HttpService) { }

    async consultCnpj(cnpj: string): Promise<any> {
        // Remove non-numeric characters
        const cleanCnpj = cnpj.replace(/\D/g, '');

        if (cleanCnpj.length !== 14) {
            throw new HttpException('CNPJ deve conter 14 dígitos', 400);
        }

        try {
            // Using public.cnpj.ws as requested
            const response = await lastValueFrom(
                this.httpService.get(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`)
            );
            return response.data;
        } catch (error) {
            const status = error.response?.status || 500;
            const message = error.response?.data?.detalhes || 'Falha ao consultar CNPJ';
            throw new HttpException(message, status);
        }
    }
}
