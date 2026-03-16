import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class XuxemonService {
  private url = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}
  
  //método para dar xuxes
  giveXuxe(id: number) {
    return this.http.post(`${this.url}/${id}/xuxe`, {});
  }
}
