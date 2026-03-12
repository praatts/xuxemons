import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MotxillaService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory`);
  }

  giveItemToUser(userId: number, itemId: number, quantity: number){
    return this.http.post('/api/admin/give-item', {
      userId,
      itemId,
      quantity
    });
  }
}
