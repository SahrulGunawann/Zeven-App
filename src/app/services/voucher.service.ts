import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

interface CacheEntry {
    data: any;
    expiry: number;
}

@Injectable({
    providedIn: 'root'
})
export class VoucherService {
    private apiUrl = environment.apiUrl;
    private cache = new Map<string, CacheEntry>();
    private defaultTTL = 30000; // 30 seconds

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    private getFromCache(key: string): any | null {
        const entry = this.cache.get(key);
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        if (entry) {
            this.cache.delete(key);
        }
        return null;
    }

    private setToCache(key: string, data: any, ttl = this.defaultTTL): void {
        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
    }

    public clearCache(): void {
        this.cache.clear();
    }

    getVouchers(): Observable<any> {
        const cacheKey = 'vouchers';
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return of(cached);
        }
        return this.http.get(`${this.apiUrl}/vouchers`, { headers: this.getHeaders() }).pipe(
            tap(res => this.setToCache(cacheKey, res))
        );
    }

    checkVoucher(code: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/vouchers/check`, { code }, { headers: this.getHeaders() });
    }
}
