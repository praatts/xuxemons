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

  getUserXuxemons(): Observable<Xuxemon[]> {
    return this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxedex`);
  }

  getOwnedXuxemons(): Observable<Xuxemon[]> {
    return this.http.get<Xuxemon[]>(`${this.apiUrl}/xuxedex/owned`);
  }

  addRandomXuxemon(player_id: number): Observable<Xuxemon> {
    return this.http.post<Xuxemon>(`${this.apiUrl}/xuxedex/add-random/${player_id}`, {});
  }

  //método para dar xuxes
  giveXuxe(id: number, type: string) {
    return this.http.post(`${this.apiUrl}/xuxemons/${id}/xuxe`, {type});
  }

  setUserXuxemons(xuxemons: Xuxemon[]): void {
    this.xuxemons = xuxemons;
    this.userXuxemonsSubject.next(xuxemons);
  }

  setOwnedXuxemons(xuxemons: Xuxemon[]): void {
    this.ownedXuxemonsSubject.next(xuxemons);
  }

  addToOwnedXuxemons(xuxemon: Xuxemon): void {
    const updated = [...this.ownedXuxemonsSubject.value, xuxemon];
    this.ownedXuxemonsSubject.next(updated);
    console.log('Xuxemon afegit correctament');
  }

  getCurrentUserXuxemons(): Xuxemon[] {
    return this.userXuxemonsSubject.value;
  }

  getCurrentOwnedXuxemons(): Xuxemon[] {
    return this.ownedXuxemonsSubject.value;
  }

}
