import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Friend } from '../../../interfaces/friend';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends/`);
  }

  getRequests(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends/requests`);
  }

  sendRequest(friend_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/requests`, { friend_id });
  }

  acceptRequest(request_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/requests/${request_id}/accept`, {});
  }

  rejectRequest(request_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/friends/requests/${request_id}/reject`, {});
  }

  deleteFriend(friend_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/friends/${friend_id}`);
  }
}
