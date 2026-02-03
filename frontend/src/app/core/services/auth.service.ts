import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface LoginResponse {
    access_token: string;
}

interface UserPayload {
    sub: string;
    email: string;
    role: string;
    exp: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/api/v1/auth';
    private tokenKey = 'access_token';

    // Signals for reactive state
    currentUser = signal<UserPayload | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromStorage();
    }

    login(credentials: { email: string, password: string }): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => this.setSession(response.access_token))
        );
    }

    logout() {
        localStorage.removeItem(this.tokenKey);
        this.currentUser.set(null);
        this.router.navigate(['/login']);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = jwtDecode<UserPayload>(token);
            const isExpired = decoded.exp * 1000 < Date.now();
            if (isExpired) {
                this.logout();
                return false;
            }
            return true;
        } catch {
            this.logout();
            return false;
        }
    }

    hasRole(role: string): boolean {
        return this.currentUser()?.role === role;
    }

    private setSession(token: string) {
        localStorage.setItem(this.tokenKey, token);
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        const token = this.getToken();
        if (token) {
            try {
                const decoded = jwtDecode<UserPayload>(token);
                this.currentUser.set(decoded);
            } catch {
                this.logout();
            }
        }
    }
}
