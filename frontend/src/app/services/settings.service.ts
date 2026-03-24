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

  //función para listar todas las settings
  getSettings(){
    return this.httpClient.get<Setting[]>(`${this.url}/settings`);
  }

  //update de settings
  updateSettings(settings: any){
    return this.httpClient.put(`${this.url}/settings/update`, settings);
  }

}
