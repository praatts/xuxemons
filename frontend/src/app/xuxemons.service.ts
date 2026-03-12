import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Xuxemon } from '../../interfaces/xuxemon';

@Injectable({
  providedIn: 'root'
})
export class XuxemonsService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:8000/api';

  getUserXuxemons() {
    return this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxedex`);
  }

  getOwnedXuxemons() {
    return this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxedex/owned`);
  }
}
