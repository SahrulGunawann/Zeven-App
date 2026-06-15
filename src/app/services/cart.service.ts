import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private apiUrl = environment.apiUrl;
    private cartCountSubject = new BehaviorSubject<number>(0);
    cartCount$ = this.cartCountSubject.asObservable();

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        // Initial fetch
        this.updateCartCount();
    }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    updateCartCount() {
        this.getCart().subscribe({
            next: (res) => this.cartCountSubject.next(res?.items?.length || 0),
            error: () => this.cartCountSubject.next(0)
        });
    }

    getCart(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/cart`, { headers: this.getHeaders() }).pipe(
            tap(res => this.cartCountSubject.next(res?.items?.length || 0))
        );
    }

    addToCart(productId: number, quantity: number = 1, replaceQuantity: boolean = false): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/cart/add`, {
            product_id: productId,
            quantity: quantity,
            replace_quantity: replaceQuantity
        }, { headers: this.getHeaders() }).pipe(
            tap(() => this.updateCartCount())
        );
    }

    updateQuantity(id: number, quantity: number): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/cart/item/${id}`, {
            quantity: quantity
        }, { headers: this.getHeaders() }).pipe(
            tap(() => this.updateCartCount())
        );
    }

    removeItem(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/cart/item/${id}`, { headers: this.getHeaders() }).pipe(
            tap(() => this.updateCartCount())
        );
    }
}
