import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MotxillaService {

  private apiUrl = 'http://localhost:8000/api';

  private inventorySubject = new BehaviorSubject<any[]>([]);
  private allItemsSubject = new BehaviorSubject<any[]>([]);

  public inventory$: Observable<any[]>;
  public allItems$: Observable<any[]>;

  constructor(private http: HttpClient) {
    this.inventory$ = this.inventorySubject.asObservable();
    this.allItems$ = this.allItemsSubject.asObservable();
  }

  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory`);
  }

  giveItemToUser(user_id: number, item_id: number, quantity: number) {
    return this.http.post(`${this.apiUrl}/inventory/add-xuxes/${user_id}`, {
      item_id: item_id,
      quantity: quantity
    });
  }

  getAllItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/items`);
  }

  setInventory(inventory: any[]): void {
    this.inventorySubject.next(inventory);
  }

  setAllItems(items: any[]): void {
    this.allItemsSubject.next(items);
  }

  getCurrentInventory(): any[] {
    return this.inventorySubject.value;
  }

  getCurrentAllItems(): any[] {
    return this.allItemsSubject.value;
  }
}
