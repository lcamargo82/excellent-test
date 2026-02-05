import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { PaginatedResult } from '../../clients/models/client.model'; // Reusing generic interface

@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    private http = inject(HttpClient);
    private apiUrl = '/api/v1/products';

    getProducts(page: number = 1, limit: number = 10, available?: boolean): Observable<PaginatedResult<Product>> {
        let params = new HttpParams()
            .set('page', page)
            .set('limit', limit);

        if (available) {
            params = params.set('available', 'true');
        }
        return this.http.get<PaginatedResult<Product>>(this.apiUrl, { params });
    }

    getProduct(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(this.apiUrl, product);
    }

    updateProduct(id: string, product: Partial<Product>): Observable<Product> {
        return this.http.patch<Product>(`${this.apiUrl}/${id}`, product);
    }

    deleteProduct(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    uploadImages(id: string, files: File[]): Observable<any> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        return this.http.post(`${this.apiUrl}/${id}/images`, formData);
    }

    deleteImage(imageId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/images/${imageId}`);
    }
}
