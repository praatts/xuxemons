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

  //Retorna un boolean que indica si l'usuari està autenticat (true si hi ha un token d'accés vàlid, false en cas contrari).
  isLogged() : boolean {
    return this.getToken() !== null;
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
}
