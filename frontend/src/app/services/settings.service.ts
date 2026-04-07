import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Setting {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private url = 'http://localhost:8000/api';

  constructor(private httpClient: HttpClient) { }

  //Mètode per llistar totes les configuracions disponibles (s'ha de ser admin per accedir-hi) que retorna un observable amb la llista de configuracions.
  getSettings(){
    return this.httpClient.get<Setting[]>(`${this.url}/settings`);
  }

  //Mètode per actualitzar les configuracions disponibles (s'ha de ser admin per accedir-hi) que envia les noves configuracions al backend.
  updateSettings(settings: any){
    return this.httpClient.put(`${this.url}/settings/update`, settings);
  }
}
