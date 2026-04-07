import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';
import { Friend } from '../../../interfaces/friend';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {

  private apiUrl = 'http://localhost:8000/api';

  private friendsSubject = new BehaviorSubject<Friend[]>([]);
  private requestsSubject = new BehaviorSubject<Friend[]>([]);
  private sentRequestsSubject = new BehaviorSubject<Friend[]>([]);
  private statusesSubject = new BehaviorSubject<any>({});
  public friends$;
  public requests$
  public sentRequests$;
  public statuses$;

  private pollingSubscription = new Subscription();

  constructor(private http: HttpClient) {
    this.friends$ = this.friendsSubject.asObservable();
    this.requests$ = this.requestsSubject.asObservable();
    this.sentRequests$ = this.sentRequestsSubject.asObservable();
    this.statuses$ = this.statusesSubject.asObservable();
  }

  //Carregar de dades relacionades amb la amistat entre usuaris i actualitzar els observables corresponents, funció que es crida periòdicament per mantenir les dades actualitzades.
  startPolling(): void {
    this.loadAll();
    this.pollingSubscription = interval(2000).subscribe(() => {
      this.loadAll();
    });
  }

  //Atura el polling que actualitza les dades per evitar crides innecessàries al backend
  stopPolling(): void {
    this.pollingSubscription.unsubscribe();
  }

  //Métode que carrega totes les dades relacionades i les actualitza constantment.
  private loadAll(): void {
    this.getFriends().subscribe(data => this.friendsSubject.next(data));
    this.getRequests().subscribe(data => this.requestsSubject.next(data));
    this.getSentRequests().subscribe(data => this.sentRequestsSubject.next(data));
    this.getStatus().subscribe(data => this.statusesSubject.next(data));
  }

  //Retorna un observable amb la llista d'amics de l'usuari autenticat.
  getFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends`);
  }

  //Retorna un observable amb la llista de sol·licituds d'amistat rebudes per l'usuari autenticat.
  getRequests(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends/requests`);
  }

  //Envia una sol·licitud d'amistat a un altre usuari.
  sendRequest(friend_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/request`, { friend_id });
  }

  //Accepta una sol·licitud d'amistat rebuda.
  acceptRequest(request_id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/friends/${request_id}/accept`, {});
  }

  //Rebutja una sol·licitud d'amistat rebuda.
  rejectRequest(request_id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/friends/${request_id}/reject`, {});
  }

  //Crida al endpoint que elimina una amistat existent entre l'usuari autenticat i un altre usuari (acceptada prèviament).
  deleteFriend(friend_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/${friend_id}`);
  }

  //Retorna tots els usuaris registrats a l'aplicació (menys usuari autenticat) per mostrar-los a la pestanya de cerca d'amics.
  getAllPlayers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends/players`);
  }

  //Retorna un observable amb l'estat de les relacions d'amistat entre l'usuari autenticat ('pending', 'accepted')
  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends/status`);
  }

  //Retorna un observable amb la llista de sol·licituds d'amistat enviades per l'usuari autenticat.
  getSentRequests(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends/requests/sent`);
  }

  //Revoca una sol·licitud d'amistat enviada per l'usuari autenticat (similar a deleteFriend però per sol·licituds pendents)
  revokeRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/${id}/revoke`);
  }
}
