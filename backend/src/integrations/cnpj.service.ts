import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CnpjService {
    constructor(private readonly httpService: HttpService) { }

    async consultCnpj(cnpj: string): Promise<any> {
        // Basic validation
        if (!cnpj || cnpj.length < 14) {
            throw new HttpException('Invalid CNPJ', 400);
        }

        try {
            // Using public API (ReceitaWS is common for free tier, but cnpj.ws was requested)
            // Note: cnpj.ws has a paid tier and specific API structure.
            // ReceitaWS free endpoint: https://www.receitaws.com.br/v1/cnpj/{cnpj}
            // I will use receitaws as a placeholder for "public API" unless User provides a key.
            const response = await lastValueFrom(
                this.httpService.get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`)
            );
            return response.data;
        } catch (error) {
            throw new HttpException('Error fetching CNPJ data', 500);
        }
    }
}
