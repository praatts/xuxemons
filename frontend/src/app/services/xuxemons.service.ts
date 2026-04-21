import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Xuxemon } from '../../../interfaces/xuxemon';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class XuxemonsService {

  private apiUrl = 'http://localhost:8000/api';
  private xuxemons: Xuxemon[] = [];
  private userXuxemonsSubject = new BehaviorSubject<Xuxemon[]>([]);
  private ownedXuxemonsSubject = new BehaviorSubject<Xuxemon[]>([]);
  public userXuxemons$;
  public ownedXuxemons$;

  constructor(private http: HttpClient) {
    this.userXuxemons$ = this.userXuxemonsSubject.asObservable();
    this.ownedXuxemons$ = this.ownedXuxemonsSubject.asObservable();
  }

  //Retorna un observable amb la llista de xuxemons de l'usuari autenticat
  getUserXuxemons(): Observable<Xuxemon[]> {
    return this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxedex`);
  }

  //Retorna un observable amb la llista de xuxemons propietat de l'usuari autenticat
  getOwnedXuxemons(): Observable<Xuxemon[]> {
    return this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxedex/owned`);
  }

  //Afegeix un xuxemon aleatori a l'usuari especificat (s'ha de ser admin per accedir-hi) i retorna un observable amb el xuxemon afegit.
  addRandomXuxemon(player_id: number): Observable<Xuxemon> {
    return this.http.post<Xuxemon>(`${this.apiUrl}/xuxedex/add-random/${player_id}`, {});
  }

  //Mètode per donar xuxes a un xuxemon propietat de l'usuari autenticat
  giveXuxe(owned_xuxemon_id: number, type: string) {
    return this.http.post(`${this.apiUrl}/xuxemons/${owned_xuxemon_id}/xuxe`, { type });
  }

  //Mètode per actualitzar la llista de xuxemons de l'usuari autenticat i emetre els canvis als components subscrits.
  setUserXuxemons(xuxemons: Xuxemon[]): void {
    this.xuxemons = xuxemons;
    this.userXuxemonsSubject.next(xuxemons);
  }

  //Mètode per actualitzar la llista de xuxemons propietat de l'usuari autenticat i emetre els canvis als components subscrits.
  setOwnedXuxemons(xuxemons: Xuxemon[]): void {
    this.ownedXuxemonsSubject.next(xuxemons);
  }

  //Mètode per afegir un xuxemon a la llista de xuxemons propietat de l'usuari autenticat , torna a recorrer la llista i actualitza el estat de owned a true per al xuxemon afegit i emet els canvis als components subscrits.
  addToOwnedXuxemons(xuxemon: Xuxemon): void {
    const updated = [...this.ownedXuxemonsSubject.value, xuxemon];
    this.ownedXuxemonsSubject.next(updated);
    const updatedAll = this.userXuxemonsSubject.value.map(x =>
      x.id === xuxemon.id ? { ...x, owned: true } : x
    );
    this.xuxemons = updatedAll;
    this.userXuxemonsSubject.next(updatedAll);

  }

  //Mètode per obtenir la llista actual de xuxemons de l'usuari autenticat.
  getCurrentUserXuxemons(): Xuxemon[] {
    return this.userXuxemonsSubject.value;
  }

  //Mètode per obtenir la llista actual de xuxemons propietat de l'usuari autenticat.
  getCurrentOwnedXuxemons(): Xuxemon[] {
    return this.ownedXuxemonsSubject.value;
  }

  //Mètode per afegir una malaltia a un xuxemon propietat de l'usuari autenticat (s'ha de ser admin per accedir-hi) i retorna un observable amb la resposta del backend.
  addIllness(owned_id: number, illness: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/xuxedex/${owned_id}/illness`, { illness });
  }

  //Mètode per obtenir els xuxemons propietat d'un usuari específic.
  getOwnedXuxemonsByUser(user_id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/xuxedex/owned/${user_id}`);
  }

  //Mètode per vacunar un xuxemon propietat de l'usuari autenticat.
  giveVaccine(owned_xuxemon_id: number, item_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/xuxemons/${owned_xuxemon_id}/vaccinate`, { item_id });
  }

  //Mètode per eliminar un xuxemon capturat específic de l'usuari autenticat.
  deleteOwnedXuxemon(owned_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/xuxedex/owned/${owned_id}`);
  }
}