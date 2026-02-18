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
    return this.http.post(`${this.url}/store/users`, user);
  }

  checkEmailExists(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);

      return of(control.value).pipe(
        debounceTime(500),
        switchMap(value => this.http.get<{ exists: boolean }>(`${this.url}/check-email`, { params: { email: value } })
        ),
        map(response => (response.exists ? { emailExists: true } : null)),
        catchError(() => of(null)),
        first()
      );
    };
  }
}
