import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8000/api';
  private jwtHelper = new JwtHelperService();
  private autoLogoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    this.initializeAutoLogout();
  }

  //Envia les credencials de l'usuari al backend per autenticar-lo i, si és correcte, guarda el token d'accés retornat al localStorage.
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        const token = response?.access_token ?? response?.token;
        if (token) {
          localStorage.setItem('access_token', token);
          if (response?.user_id !== undefined && response?.user_id !== null) {
            localStorage.setItem('user_id', String(response.user_id));
          }
          this.scheduleAutoLogout(token);
        }
        return response;
      })
    );
  }

  //Elimina el token d'accés del localStorage per desautenticar l'usuari.
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      map(() => {
        this.forceLogout();
        return null;
      }),
      catchError(() => {
        this.forceLogout();
        return of(null);
      })
    );
  }

  forceLogout() {
    this.clearAutoLogoutTimer();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    this.router.navigate(['/']);
  }

  //Retorna el token d'accés guardat al localStorage, o null si no existeix.
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  //Retorna un boolean que indica si l'usuari està autenticat (true si hi ha un token d'accés vàlid i no ha expirat, false en cas contrari).
  isLogged(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      this.forceLogout();
      return false;
    }
    return true;
  }

  private initializeAutoLogout(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }

    if (this.isTokenExpired(token)) {
      this.forceLogout();
      return;
    }

    this.scheduleAutoLogout(token);
  }

  private scheduleAutoLogout(token: string): void {
    this.clearAutoLogoutTimer();

    const expiration = this.jwtHelper.getTokenExpirationDate(token);
    if (!expiration) {
      this.forceLogout();
      return;
    }

    const delay = expiration.getTime() - Date.now();
    if (delay <= 0) {
      this.forceLogout();
      return;
    }

    this.autoLogoutTimer = setTimeout(() => {
      this.forceLogout();
    }, delay);
  }

  private clearAutoLogoutTimer(): void {
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
      this.autoLogoutTimer = null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      return this.jwtHelper.isTokenExpired(token);
    } catch {
      return true;
    }
  }

  //Retorna el perfil de l'usuari autenticat.
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  //Retorna un boolean que indica si l'usuari autenticat té el rol d'administrador (admin).
  isAdmin(): Observable<boolean> {
    return this.getProfile().pipe(
      map(user => user.role === 'admin')
    );
  }

  getUserId(): Observable<number> {
    return this.getProfile().pipe(
      map(user => user.id)
    );
  }
}
