import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class XuxemonsService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8000/api';

  getAllXuxemons() {
    return this.http.get(`${this.apiUrl}/xuxedex/all`);
  }
}
