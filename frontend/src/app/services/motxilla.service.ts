import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MotxillaService {

  private apiUrl = 'http://localhost:8000/api';

  //BehaviorSubjects per mantenir l'estat de la motxilla (inventari) i la llista de tots els ítems disponibles.
  private inventorySubject = new BehaviorSubject<any[]>([]);
  private allItemsSubject = new BehaviorSubject<any[]>([]);

  public inventory$: Observable<any[]>;
  public allItems$: Observable<any[]>;

  constructor(private http: HttpClient) {
    this.inventory$ = this.inventorySubject.asObservable();
    this.allItems$ = this.allItemsSubject.asObservable();
  }

  //Retorna un observable amb la llista d'ítems actuals a la motxilla de l'usuari autenticat.
  getInventory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory`);
  }

  //Envia una sol·licitud al backend per afegir una quantitat específica d'un ítem a la motxilla d'un usuari, identificat pel seu ID. (S'ha de ser admin per fer aquesta acció)
  giveItemToUser(user_id: number, item_id: number, quantity: number) {
    return this.http.post(`${this.apiUrl}/inventory/add-item/${user_id}`, {
      item_id: item_id,
      quantity: quantity
    });
  }

  //Retorna un observable amb la llista de tots els ítems disponibles al backend, que es poden afegir a la motxilla.
  getAllItems(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/inventory/items`);
  }

  //Actualitza els BehaviorSubjects amb les noves dades d'inventari i de tots els ítems disponibles, permetent que els components que estan subscrits a aquests observables rebin les dades actualitzades.
  setInventory(inventory: any[]): void {
    this.inventorySubject.next(inventory);
  }

  //Actualitza la llista de tots els ítems disponibles que provenen del backend.
  setAllItems(items: any[]): void {
    this.allItemsSubject.next(items);
  }

  //Retorna l'estat actual de l'inventari de l'usuari autenticat.
  getCurrentInventory(): any[] {
    return this.inventorySubject.value;
  }

  //Retorna l'estat actual de la llista de tots els ítems disponibles.
  getCurrentAllItems(): any[] {
    return this.allItemsSubject.value;
  }

  //Elimina un ítem de la motxilla de l'usuari autenticat, identificat pel seu slot_id
  deleteItemFromInventory(slot_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/inventory/delete/item/${slot_id}`);
  }
}
