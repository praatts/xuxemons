import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Battle } from '../../../interfaces/battle';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class BattleService {

  private apiUrl = 'http://localhost:8000/api';
  private battlesSubject = new BehaviorSubject<Battle[]>([]);
  public battles$;
  private echo: Echo<any> | null = null;

  constructor(private http: HttpClient) { 
    this.battles$ = this.battlesSubject.asObservable();
  }

  //Inicialitza Laravel Echo amb Pusher per escoltar events de batalla en temps real
  private initializeEcho(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    if (this.echo) return true;

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

    return true;
  }

  //Subscriu el component al canal privat de la batalla per rebre actualitzacions en temps real
  subscribeToBattleChannel(battleId: number, callback: (battle: Battle) => void): void {
    if (!this.initializeEcho() || !this.echo) return;

    this.echo.private(`battle.${battleId}`)
      .listen('.battle.updated', (data: any) => {
        callback(data.battle);
      });
  }

  //Cancel·la la subscripció al canal de la batalla
  unsubscribeFromBattleChannel(battleId: number): void {
    if (!this.echo) return;
    this.echo.leave(`battle.${battleId}`);
  }

  //Mètode que carrega les battalles de l'usuari autenticat i les actualitza al BehaviorSubject.
  loadBattles() {
    this.http.get<Battle[]>(`${this.apiUrl}/battles`).subscribe({
      next: (battles) => this.battlesSubject.next(battles),
      error: (err) => console.error('Error carregant les batalles:', err)
    });
  }

  //Escriptura llista de batalles emesa pel BehaviorSubject.
  setBattles(battles: Battle[]): void {
    this.battlesSubject.next(battles);
  }

  //Lectura dels valors del BehaviorSubject de batalles.
  getBattles(): Battle[] {
    return this.battlesSubject.value;
  }

  //Mètode per acceptar una batalla pendent, actualitzant el seu estat a "accepted" i permetent iniciar la batalla.
  acceptBattle(battle_id: number): Observable<Battle> {
    return this.http.post<Battle>(`${this.apiUrl}/battles/${battle_id}/accept`, {});
  }

  //Mètode per seleccionar un xuxemon per a una batalla acceptada (cada jugador tria el seu xuxemon sa)
  selectXuxemon(battle_id: number, owned_xuxemon_id: number): Observable<Battle> {
    return this.http.post<Battle>(`${this.apiUrl}/battles/${battle_id}/select-xuxemon`, { owned_xuxemon_id });
  }

  //Mètode que inicia la batalla (tirada de daus + modificadors + determinar guanyador)
  fightBattle(battle_id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/battles/${battle_id}/fight`, {});
  }

  //Mètode per enviar una petició de batalla a un amic (des de la pàgina d'amics).
  createBattleRequest(player_two_id: number): Observable<Battle> {
    return this.http.post<Battle>(`${this.apiUrl}/battles`, { player_two_id });
  }

  //Mètode per obtenir una batalla específica per la seva id
  getBattleById(battle_id: number): Battle | undefined {
    return this.battlesSubject.value.find(b => b.id === battle_id);
  }
}
