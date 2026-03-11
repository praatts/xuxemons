import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) {}

    login(credentials: any) : Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
        map(response => {
          if (response && response.access_token) {
            localStorage.setItem('access_token', response.access_token);
          }
          return response;
        })
      );
    }

    logout() : Observable<any> {
      return this.http.post(`${this.apiUrl}/logout`, {});
    }

    getToken(): string | null {
      return localStorage.getItem('access_token');
    }

    isLogged() : boolean {
      return this.getToken() !== null;
    }

    getProfile() : Observable<any> {
      return this.http.get<any>(`${this.apiUrl}/profile`);
    }


}
