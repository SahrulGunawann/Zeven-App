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
export class OrderService {
    private apiUrl = environment.apiUrl;
    private cache = new Map<string, CacheEntry>();
    private defaultTTL = 15000; // 15 seconds

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

    public clearCache(keyPrefix?: string): void {
        if (keyPrefix) {
            for (const key of this.cache.keys()) {
                if (key.startsWith(keyPrefix)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    checkout(shippingAddress: string, voucherCode: string = '', cartItemIds: number[] = [], paymentMethod: string = 'COD'): Observable<any> {
        this.clearCache();
        return this.http.post<any>(`${this.apiUrl}/checkout`, {
            shipping_address: shippingAddress,
            voucher_code: voucherCode,
            cart_item_ids: cartItemIds,
            payment_method: paymentMethod
        }, { headers: this.getHeaders() });
    }

    getPaymentToken(orderId: number, paymentType: string = ''): Observable<any> {
        const body: any = { order_id: orderId };
        if (paymentType) body.payment_type = paymentType;
        return this.http.post<any>(`${this.apiUrl}/payment/get-token`, body, { headers: this.getHeaders() });
    }

    checkPaymentStatus(orderId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/payment/check-status/${orderId}`, { headers: this.getHeaders() });
    }

    checkVoucher(code: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/vouchers/check`, { code }, { headers: this.getHeaders() });
    }

    getMyOrders(): Observable<any> {
        const cacheKey = 'orders_list';
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return of(cached);
        }
        return this.http.get<any>(`${this.apiUrl}/my-orders`, { headers: this.getHeaders() }).pipe(
            tap(res => this.setToCache(cacheKey, res))
        );
    }

    getOrderDetails(id: number): Observable<any> {
        const cacheKey = `orders_detail_${id}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return of(cached);
        }
        return this.http.get<any>(`${this.apiUrl}/orders/${id}`, { headers: this.getHeaders() }).pipe(
            tap(res => this.setToCache(cacheKey, res))
        );
    }

    completeOrder(orderId: number): Observable<any> {
        this.clearCache();
        return this.http.post<any>(`${this.apiUrl}/orders/${orderId}/complete`, {}, { headers: this.getHeaders() });
    }

    cancelOrder(orderId: number): Observable<any> {
        this.clearCache();
        return this.http.post<any>(`${this.apiUrl}/orders/${orderId}/cancel`, {}, { headers: this.getHeaders() });
    }
}
