import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../../../interfaces/notification';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/read-all`, {});
  }
}
