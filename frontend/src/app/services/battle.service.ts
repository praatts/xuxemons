import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
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

  //Mètode que carrega les battalles de l'usuari autenticat.
  loadBattles() {
    return this.http.get<Battle[]>(`${this.apiUrl}/battles`);
  }

  //Esctirua llista de batalles emesa pel BehaviorSubject.
  setBattles(battles: Battle[]) {
    this.battlesSubject.next(battles);
  }

  //Lectura dels valors del BehaviorSubject de batalles.
  getBattles() : Battle[] {
    return this.battlesSubject.value;
  }

  //Mètode per acceptar una batalla pendent, actualitzant el seu estat a "accepted" i permetent iniciar la batalla.
  acceptBattle(battle_id: number) {
    return this.http.post(`${this.apiUrl}/battles/${battle_id}/accept`, {});
  }

  //Mètode que inicia la batalla
  fightBattle(battle_id: number) {
    return this.http.post(`${this.apiUrl}/battles/${battle_id}/fight`, {});
  }
}
