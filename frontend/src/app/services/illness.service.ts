import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Illness {
  id: number;
  key: string;
  name: string;
  description: string;
  infection_percentage: number;
}

export interface IllnessUpdate {
  key: string;
  infection_percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class IllnessService {
  private url = 'http://localhost:8000/api';

  constructor(private httpClient: HttpClient) { }

  //Retorna un observable amb la llista de malalties disponibles al backend.
  getIllnesses() {
    return this.httpClient.get<Illness[]>(`${this.url}/illnesses`);
  }

  //Envia una sol·licitud al backend per actualitzar les dades d'infecció de les malalties, 
  // enviant com a paràmetres una llista d'objectes que contenen la clau de la malaltia i el nou percentatge d'infecció.
  updateIllness(illnesses: { key: string; infection_percentage: number }[]) {
    return this.httpClient.put(`${this.url}/illnesses/update`, illnesses);
  }
}
