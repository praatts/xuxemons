import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  darkMode: boolean = false;

  //Mètode per alternar entre mode fosc/clar
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }
}
