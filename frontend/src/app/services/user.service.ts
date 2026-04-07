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

  //Mètode que retorna el perfil de l'usuari autenticat.
  getUser() {
    return this.http.get(`${this.url}/profile`);
  }

  //Mètode que retorna la llista de tots els usuaris registrats (s'ha de ser admin per accedir-hi).
  getUsers() {
    return this.http.get(`${this.url}/users`);
  }

  //Mètode per modificar l'usuari autenticat.
  updateUser(user: any) {
    return this.http.put(`${this.url}/update`, user);
  }

  //Mètode per eliminar l'usuari autenticat (endpoint pendent al backend)
  deleteUser() {
    return this.http.delete(`${this.url}/user`);
  }

  //Mètode per eliminar un usuari específic (només accessible per l'admin)
  deleteUsers(id: number) {
    return this.http.delete(`${this.url}/users/${id}/delete`);
  }

  //Mètode per obtenir tots els usuaris registrats, incloent els eliminats (s'ha de ser admin per accedir-hi). Aquest endpoint és necessari per poder restaurar usuaris eliminats.
  getAllUsers() {
    return this.http.get(`${this.url}/users/all`);
  }

  //Mètode per restaurar un usuari eliminat (només accessible per l'admin) status = 0 -> 1
  restoreUsers(id: number) {
    return this.http.post(`${this.url}/users/${id}/restore`, {});
  }

  //Mètode per registrar un nou usuari
  postUser(user: UserInterface) {
    return this.http.post(`${this.url}/register`, user);
  }

  //Mètode per obtenir el token d'accés guardat al localStorage, o null si no existeix.
  getToken() {
    return localStorage.getItem('access_token');
  }

  //Mètode per comprovar si l'usuari està autenticat.
  isAutentificated(): boolean {
    return !!this.getToken();
  }

  //Mètode per iniciar sessió, que envia les credencials de l'usuari al backend i, si són correctes, guarda el token d'accés retornat al localStorage.
  logIn(email: string, password: string) {
    return this.http.post<{ token: string, user_id: number }>(`${this.url}/login`, { email, password }).pipe(
      map(response => {
        localStorage.setItem('access_token', response.token);
        localStorage.setItem('user_id', response.user_id.toString());
        return response;
      })
    );
  }

  //Mètode per tancar sessió, que elimina el token d'accés i l'ID de l'usuari del localStorage.
  logOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
  }

  //Mètode per comprovar si un email ja està registrat, retorna un AsyncValidatorFn per validar si aquest email ja existeix al backend
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
