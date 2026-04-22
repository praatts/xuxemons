import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private echo: Echo<any> | null = null;

  //Inicialitza Laravel Echo amb Pusher per escoltar events en temps real.
  //Retorna la instància de Echo si l'inicialització és correcta, null en cas contrari.
  getEcho(): Echo<any> | null {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    if (this.echo) return this.echo;

    (window as any).Pusher = Pusher;
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: '8a9ee89cc6e88037db28',
      cluster: 'eu',
      forceTLS: true,
      authEndpoint: 'http://localhost:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    return this.echo;
  }

  //Retorna el socket ID de la connexió actual, útil per excloure el propi usuari dels broadcasts.
  getSocketId(): string | null {
    return this.echo?.socketId() ?? null;
  }

  //Deixa d'escoltar un canal concret.
  leaveChannel(channel: string): void {
    this.echo?.leave(channel);
  }
}
