import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface AuthResponse {
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  public storageUrl = environment.storageUrl + '/';
  private authToken$ = new BehaviorSubject<string | null>(null);
  private currentUser$ = new BehaviorSubject<any>(null);

  getProfileImage(path: string | null | undefined, name: string): string {
    if (!path) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=C68E17&color=fff`;
    }
    // If path is already a full URL (from backend accessor), return it
    if (path.startsWith('http')) {
      return path;
    }
    return this.storageUrl + path;
  }

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  private loadToken(): void {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.authToken$.next(token);
        const userStr = localStorage.getItem('current_user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            this.currentUser$.next(user);
          } catch (e) {
            console.error('Invalid user data in storage');
            this.logout();
          }
        }
      }
    } catch (e) {
      console.error('Error loading token from storage');
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }, { headers }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.authToken$.next(response.token);
          this.currentUser$.next(response.user);
        }
      })
    );
  }

  loginGoogleAPK(userData: any): Observable<AuthResponse> {
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/google`, userData, { headers }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.authToken$.next(response.token);
          this.currentUser$.next(response.user);
        }
      })
    );
  }

  registerBuyer(name: string, email: string, password: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.post<AuthResponse>(`${this.apiUrl}/register-buyer`, { name, email, password }, { headers });
  }

  registerSeller(name: string, email: string, password: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({ 'Accept': 'application/json' });
    return this.http.post<AuthResponse>(`${this.apiUrl}/register-seller`, { name, email, password }, { headers });
  }

  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}, { headers: this.getHeaders() }).pipe(
      tap(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
        this.authToken$.next(null);
        this.currentUser$.next(null);
      })
    );
  }

  getToken(): string | null {
    return this.authToken$.value;
  }

  getToken$(): Observable<string | null> {
    return this.authToken$.asObservable();
  }

  getCurrentUser(): any {
    return this.currentUser$.value;
  }

  getCurrentUser$(): Observable<any> {
    return this.currentUser$.asObservable();
  }

  isAuthenticated(): boolean {
    return !!this.authToken$.value;
  }

  isAuthenticated$(): Observable<boolean> {
    return this.authToken$.pipe(map(token => !!token));
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() }).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.currentUser$.next(response.user);
        }
      })
    );
  }

  updateAvatar(formData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/avatar`, formData, { headers: this.getHeaders() }).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.currentUser$.next(response.user);
        }
      })
    );
  }

  deleteAvatar(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile/avatar`, { headers: this.getHeaders() }).pipe(
      tap((response: any) => {
        if (response.user) {
          localStorage.setItem('current_user', JSON.stringify(response.user));
          this.currentUser$.next(response.user);
        }
      })
    );
  }

  updateFcmToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-fcm-token`, { fcm_token: token }, { headers: this.getHeaders() });
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }
}
