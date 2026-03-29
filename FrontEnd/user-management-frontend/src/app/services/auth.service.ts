import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { LoginRequest } from '../models/login-request.model';
import { SignupRequest } from '../models/signup-request.model';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api';

    // SSR-safe platform check
    private platformId = inject(PLATFORM_ID);
    private isBrowser = isPlatformBrowser(this.platformId);

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // Only access localStorage in the browser
        if (this.isBrowser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                try {
                    this.currentUserSubject.next(JSON.parse(stored));
                } catch {
                    localStorage.removeItem('currentUser');
                }
            }
        }
    }

    login(payload: LoginRequest): Observable<User> {
        return this.http
            .post<User>(`${this.apiUrl}/auth/login`, payload)
            .pipe(tap((user) => this.setCurrentUser(user)));
    }

    signup(
        payload: SignupRequest,
        setAsCurrentUser: boolean = true,
        performedBy?: string
    ): Observable<User> {
        let url = `${this.apiUrl}/auth/signup`;
        if (performedBy) {
            url += `?performedBy=${encodeURIComponent(performedBy)}`;
        }

        return this.http.post<User>(url, payload).pipe(
            tap((user) => {
                // normal signup from /auth page -> log in as new user
                if (setAsCurrentUser) {
                    this.setCurrentUser(user);
                }
            })
        );
    }

    setCurrentUser(user: User | null): void {
        this.currentUserSubject.next(user);

        // localStorage only on browser
        if (!this.isBrowser) {
            return;
        }

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    }

    getCurrentUserSync(): User | null {
        return this.currentUserSubject.value;
    }

    isAdmin(): boolean {
        const user = this.getCurrentUserSync();
        return !!user && user.role === 'ADMIN';
    }

    logout(): void {
        this.setCurrentUser(null);
    }
}