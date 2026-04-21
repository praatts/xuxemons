import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Battle } from '../../../interfaces/battle';

@Injectable({
  providedIn: 'root'
})
export class BattleService {

  private apiUrl = 'http://localhost:8000/api';
  private battlesSubject = new BehaviorSubject<Battle[]>([]);
  public battles$;

  constructor(private http: HttpClient) { 
    this.battles$ = this.battlesSubject.asObservable();
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
