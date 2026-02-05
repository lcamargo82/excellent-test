import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, PaginatedResult } from '../models/client.model';

@Injectable({
    providedIn: 'root'
})
export class ClientsService {
    private http = inject(HttpClient);
    private apiUrl = '/api/v1/clients';

    getClientMe(): Observable<Client> {
        return this.http.get<Client>(`${this.apiUrl}/me`);
    }

    getClients(page: number = 1, limit: number = 10, search?: string): Observable<PaginatedResult<Client>> {
        let params = new HttpParams()
            .set('page', page)
            .set('limit', limit);

        if (search) {
            params = params.set('search', search);
        }
        return this.http.get<PaginatedResult<Client>>(this.apiUrl, { params });
    }

    getClient(id: string): Observable<Client> {
        return this.http.get<Client>(`${this.apiUrl}/${id}`);
    }

    createClient(client: Partial<Client>): Observable<Client> {
        return this.http.post<Client>(this.apiUrl, client);
    }

    updateClient(id: string, client: Partial<Client>): Observable<Client> {
        return this.http.patch<Client>(`${this.apiUrl}/${id}`, client);
    }

    deleteClient(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
