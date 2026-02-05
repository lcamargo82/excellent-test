import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, PaginatedResult } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private http = inject(HttpClient);
    private apiUrl = '/api/v1/users';

    getUsers(page: number = 1, limit: number = 10, search?: string): Observable<PaginatedResult<User>> {
        let params = new HttpParams()
            .set('page', page)
            .set('limit', limit);
        if (search) {
            params = params.set('search', search);
        }
        return this.http.get<PaginatedResult<User>>(this.apiUrl, { params });
    }

    createUser(user: CreateUserDto): Observable<User> {
        return this.http.post<User>(this.apiUrl, user);
    }

    updateRole(id: string, role: string): Observable<User> {
        return this.http.patch<User>(`${this.apiUrl}/${id}/role`, { role });
    }
}
