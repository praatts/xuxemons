import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification } from '../../../interfaces/notification';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8000/api';
  //BehaviorSubject per mantenir l'estat de les notificacions i un observable per permetre que els components es subscriguin a les actualitzacions de les notificacions.
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) { }
  //Carrega les notificacions de l'usuari autenticat i les actualitza al BehaviorSubject.
  loadNotifications() {
    this.http.get<Notification[]>(`${this.apiUrl}/notifications`).subscribe(data => {
      this.notificationsSubject.next(data);
    });
  }

  //Retorna el nombre de notificacions no llegides, filtrant les notificacions actuals per aquelles que tenen la propietat "read" com a false. (s'utilitza per mostrar-ho a la secció de notificacions)
  get unreadCount(): number {
    return this.notificationsSubject.value.filter(n => !n.read).length;
  }

  //Retorna un observable amb la llista de notificacions de l'usuari autenticat.
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications`);
  }

  //Marca una notificació específica com a llegida, enviant una sol·licitud al backend amb l'ID de la notificació que es vol marcar com a llegida.
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/${id}/read`, {});
  }

  //Marca totes les notificacions com a llegides, enviant una sol·licitud al backend.
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/read-all`, {});
  }

  //Elimina totes les notificacions llegides (read = true) de l'usuari autenticat.
  deleteRead(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/notifications/read`);
  }

}
