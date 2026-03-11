import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';
import { HostBinding } from '@angular/core';

@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [],
  templateUrl: './xuxedex.component.html',
  styleUrl: './xuxedex.component.css'
})
export class XuxedexComponent {
  constructor(public theme: ThemeService){}
  @HostBinding('class.dark-mode')
  get darkMode(){
    return this.theme.darkMode;
  }
}
