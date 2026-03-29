import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { UpdateUserRequest } from '../models/update-user-request.model';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private apiUrl = 'http://localhost:8080/api/users';

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl);
    }

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }

    // optional performedBy for admin updates
    updateUser(
        id: number,
        payload: UpdateUserRequest,
        performedBy?: string
    ): Observable<User> {
        let params = new HttpParams();
        if (performedBy) {
            params = params.set('performedBy', performedBy);
        }

        return this.http.put<User>(`${this.apiUrl}/${id}`, payload, { params });
    }

    deleteUser(id: number, performedBy: string): Observable<void> {
        const params = new HttpParams().set('performedBy', performedBy);
        return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
    }

    promoteToAdmin(id: number, performedBy: string): Observable<User> {
        const params = new HttpParams().set('performedBy', performedBy);
        return this.http.put<User>(`${this.apiUrl}/${id}/promote`, {}, { params });
    }
}