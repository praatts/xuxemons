import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from '../user-interface';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, map, debounceTime, first, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // Retorna headers con el token JWT
  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  //Mètode de test per comprovar el endpoint 'test' del backend
  getTest() {
    return this.http.get(`${this.url}/test`);
  }

  //conseguir usuario
  getUser() {
    return this.http.get(`${this.url}/profile`, { headers: this.authHeaders() });
  }

  //modificar Usuarios
  updateUser(user: any) {
    return this.http.put(`${this.url}/update`, user, { headers: this.authHeaders() });
  }

  //eliminar Usuarios (endpoint pendiente en backend)
  deleteUser() {
    return this.http.delete(`${this.url}/user`, { headers: this.authHeaders() });
  }

  postUser(user: UserInterface) {
    return this.http.post(`${this.url}/register`, user);
  }

  getToken() {
    return localStorage.getItem('access_token');
  }

  isAutentificated(): boolean {
    return !!this.getToken();
  }

  logIn(email: string, password: string) {
    return this.http.post<{ token: string, user_id: number }>(`${this.url}/login`, { email, password }).pipe(
      map(response => {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('user_id', response.user_id.toString());
        return response;
      })
    );
  }

  logOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
  }

  checkEmailExists(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return this.http.get<{ exists: boolean }>(`${this.url}/check-email`, { params: { email: control.value } }).pipe(
        debounceTime(1000),
        map(response => response.exists ? { emailExists: true } : null),
        catchError(() => of(null)),
        first()
      );
    };
  }
}
