import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        let token = this.authService.getToken();

        // Fallback jika token di memori kosong but ada di localStorage
        if (!token) {
            token = localStorage.getItem('auth_token');
        }

        if (!token) {
            console.warn('ChatService: No auth token found!');
            return new HttpHeaders();
        }

        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        });
    }

    getChatList(): Observable<any> {
        const headers = this.getHeaders();
        if (!headers.has('Authorization')) return throwError(() => 'Unauthorized');
        return this.http.get(`${this.apiUrl}/chat/list`, { headers });
    }

    getMessages(userId: number): Observable<any> {
        const headers = this.getHeaders();
        if (!headers.has('Authorization')) return throwError(() => 'Unauthorized');
        return this.http.get(`${this.apiUrl}/chat/${userId}`, { headers });
    }

    sendMessage(receiverId: number, message: string): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(`${this.apiUrl}/chat/send`, {
            receiver_id: receiverId,
            message: message
        }, { headers });
    }

    markAsRead(userId: number): Observable<any> {
        const headers = this.getHeaders();
        return this.http.post(`${this.apiUrl}/chat/read/${userId}`, {}, { headers });
    }

    updateMessage(messageId: number, newMessage: string): Observable<any> {
        const headers = this.getHeaders();
        return this.http.put(`${this.apiUrl}/chat/message/${messageId}`, { message: newMessage }, { headers });
    }

    deleteMessage(messageId: number): Observable<any> {
        const headers = this.getHeaders();
        return this.http.delete(`${this.apiUrl}/chat/message/${messageId}`, { headers });
    }

    clearChat(userId: number): Observable<any> {
        const headers = this.getHeaders();
        return this.http.delete(`${this.apiUrl}/chat/clear/${userId}`, { headers });
    }

    getUserInfo(userId: number): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.apiUrl}/chat/user/${userId}`, { headers });
    }

    getAdminId(): Observable<any> {
        const headers = this.getHeaders();
        return this.http.get(`${this.apiUrl}/chat/admin-id`, { headers });
    }
}
