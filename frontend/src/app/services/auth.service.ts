import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  //Envia les credencials de l'usuari al backend per autenticar-lo i, si és correcte, guarda el token d'accés retornat al localStorage.
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

  //Elimina el token d'accés del localStorage per desautenticar l'usuari.
  logout() : Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      map(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        return null;
      })
    );
  }

  //Retorna el token d'accés guardat al localStorage, o null si no existeix.
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Verifica si el token ha expirat desxifrant el JWT
  private isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp < now;
    } catch (e) {
      return true; // Si no es pot desxifrar, el donem per invàlid/expirat
    }
  }

  //Retorna un boolean que indica si l'usuari està autenticat (true si hi ha un token d'accés vàlid i no ha expirat, false en cas contrari).
  isLogged() : boolean {
    const token = this.getToken();
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id'); // Per assegurar que netegem l'estat
      return false;
    }

    return true;
  }

  //Retorna el perfil de l'usuari autenticat.
  getProfile() : Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile`);
  }

  //Retorna un boolean que indica si l'usuari autenticat té el rol d'administrador (admin).
  isAdmin() : Observable<boolean> {
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
