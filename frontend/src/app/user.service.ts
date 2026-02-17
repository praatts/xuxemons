import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  //Mètode de test per comprovar el endpoint 'test' del backend
  getTest() {
    return this.http.get(`${this.url}/test`);
  }
}
