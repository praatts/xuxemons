import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  darkMode: boolean = false;

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }
}
