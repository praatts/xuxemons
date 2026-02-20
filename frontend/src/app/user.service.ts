import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInterface } from './user-interface';
import { AbstractControl, AsyncValidator, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/internal/operators/map';
import { catchError, debounce, debounceTime, first, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  //Mètode de test per comprovar el endpoint 'test' del backend
  getTest() {
    return this.http.get(`${this.url}/test`);
  }

  postUser(user: UserInterface) {
    return this.http.post(`${this.url}/register`, user);
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  isAutentificated(): boolean {
    return !!this.getToken();
  }

  logIn(email: string, password: string) {
    return this.http.post<{ token: string, user_id: number }>(`${this.url}/login`, { email, password }).pipe(
      map(response => {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user_id', response.user_id.toString());
        return response;
      })
    );
  }

  logOut() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_id');
  }

  checkEmailExists(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return this.http.get<{ exists: boolean }>(`${this.url}/check-email`, { params: { email: control.value } }).pipe(
        map(response => response.exists ? { emailExists: true } : null),
        catchError(() => of(null)),
        first()
      );
    };
  }
}
