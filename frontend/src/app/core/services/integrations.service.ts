import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class IntegrationsService {
    private http = inject(HttpClient);
    private apiUrl = '/api/v1/integrations';

    consultCnpj(cnpj: string): Observable<any> {
        const cleanCnpj = cnpj.replace(/\D/g, '');
        return this.http.get<any>(`${this.apiUrl}/cnpj/${cleanCnpj}`);
    }
}
