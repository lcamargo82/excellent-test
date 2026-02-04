import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderDto } from '../models/order.model';
import { PaginatedResult } from '../../clients/models/client.model';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private http = inject(HttpClient);
    private apiUrl = '/api/v1/orders';

    getOrders(page: number = 1, limit: number = 10): Observable<PaginatedResult<Order>> {
        const params = new HttpParams()
            .set('page', page)
            .set('limit', limit);
        return this.http.get<PaginatedResult<Order>>(this.apiUrl, { params });
    }

    getOrder(id: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    createOrder(order: CreateOrderDto): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, order);
    }

    deleteOrder(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
