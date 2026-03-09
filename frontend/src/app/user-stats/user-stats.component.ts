import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../user.service';
import { ThemeService } from '../services/theme.service';
import { NgClass } from '@angular/common';

interface rutas {
  label: string;
  route: string;
  exact: boolean;
}

@Component({
  selector: 'app-user-stats',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgClass, RouterLinkActive],
  templateUrl: './user-stats.component.html',
  styleUrl: './user-stats.component.css'
})
export class UserStatsComponent {

  constructor(public theme: ThemeService, private userService: UserService, private router: Router) {}

  rutas: rutas[] = [
    { label: 'Modificar Usuario', route: 'userinfo', exact: true}
  ];

  botonInfoHover = false;
}
