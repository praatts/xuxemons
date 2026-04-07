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

  startPolling(): void {
    this.loadAll();
    this.pollingSubscription = interval(2000).subscribe(() => {
      this.loadAll();
    });
  }

  stopPolling(): void {
    this.pollingSubscription.unsubscribe();
  }

  private loadAll(): void {
    this.getFriends().subscribe(data => this.friendsSubject.next(data));
    this.getRequests().subscribe(data => this.requestsSubject.next(data));
    this.getSentRequests().subscribe(data => this.sentRequestsSubject.next(data));
    this.getStatus().subscribe(data => this.statusesSubject.next(data));
  }

  getFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends`);
  }

  getRequests(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends/requests`);
  }

  sendRequest(friend_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/request`, { friend_id });
  }

  acceptRequest(request_id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/friends/${request_id}/accept`, {});
  }

  rejectRequest(request_id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/friends/${request_id}/reject`, {});
  }

  deleteFriend(friend_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/${friend_id}`);
  }

  getAllPlayers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends/players`);
  }

  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/friends/status`);
  }

  getSentRequests(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends/requests/sent`);
  }

  revokeRequest(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/${id}/revoke`);
  }
}
