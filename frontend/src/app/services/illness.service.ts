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

  getIllnesses() {
    return this.httpClient.get<Illness[]>(`${this.url}/illnesses`);
  }

  updateIllness(illnesses: { key: string; infection_percentage: number }[]) {
    return this.httpClient.put(`${this.url}/illnesses/update`, illnesses);
  }
}
