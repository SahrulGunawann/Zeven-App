import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

export interface Product {
    id: number;
    seller_id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    profile_image?: string;
    image_url: string;
    created_at: string;
    updated_at: string;
    seller?: {
        id: number;
        name: string;
    };
}

interface CacheEntry {
    data: any;
    expiry: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = environment.apiUrl;
    public storageUrl = environment.storageUrl + '/';
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

    getProducts(params: { search?: string, category?: string, min_price?: number, max_price?: number, sort_by?: string, seller_id?: number } = {}): Observable<any> {
        let url = `${this.apiUrl}/products?`;
        if (params.search) url += `search=${params.search}&`;
        if (params.category) url += `category=${params.category}&`;
        if (params.min_price) url += `min_price=${params.min_price}&`;
        if (params.max_price) url += `max_price=${params.max_price}&`;
        if (params.sort_by) url += `sort_by=${params.sort_by}&`;
        if (params.seller_id) url += `seller_id=${params.seller_id}&`;

        const cacheKey = `products_${url}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return of(cached);
        }

        return this.http.get<any>(url).pipe(
            tap(res => this.setToCache(cacheKey, res))
        );
    }

    getProduct(id: number): Observable<any> {
        const cacheKey = `product_${id}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return of(cached);
        }

        return this.http.get<any>(`${this.apiUrl}/products/${id}`).pipe(
            tap(res => this.setToCache(cacheKey, res))
        );
    }

    getProductReviews(productId: number): Observable<any> {
        const cacheKey = `reviews_${productId}`;
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return of(cached);
        }
        return this.http.get(`${this.apiUrl}/products/${productId}/reviews`).pipe(
            tap(res => this.setToCache(cacheKey, res, 15000)) // 15 seconds cache for reviews
        );
    }

    postReview(data: { product_id: number, order_id: number, rating: number, review: string }): Observable<any> {
        this.clearCache(`reviews_${data.product_id}`);
        return this.http.post(`${this.apiUrl}/reviews`, data, { headers: this.getHeaders() });
    }

    // WISHLIST METHODS
    getWishlist(): Observable<any> {
        const cacheKey = 'wishlist';
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return of(cached);
        }
        return this.http.get(`${this.apiUrl}/wishlist`, { headers: this.getHeaders() }).pipe(
            tap(res => this.setToCache(cacheKey, res, 15000))
        );
    }

    toggleWishlist(productId: number): Observable<any> {
        this.clearCache('wishlist');
        return this.http.post(`${this.apiUrl}/wishlist/toggle`, { product_id: productId }, { headers: this.getHeaders() });
    }

    checkWishlist(productId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/wishlist/check/${productId}`, { headers: this.getHeaders() });
    }

    getCategories(): Observable<any> {
        const cacheKey = 'categories';
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return of(cached);
        }
        return this.http.get(`${this.apiUrl}/categories`).pipe(
            tap(res => this.setToCache(cacheKey, res, 300000)) // 5 minutes TTL
        );
    }

    getRepliedReviews(): Observable<any> {
        return this.http.get(`${this.apiUrl}/buyer/replied-reviews`, { headers: this.getHeaders() });
    }
}
