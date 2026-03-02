import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface rutas {
  label: string;
  route: string;
  exact: boolean;
}

@Component({
  selector: 'app-user-principal',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, NgClass],
  templateUrl: './user-principal.component.html',
  styleUrl: './user-principal.component.css'
})
export class UserPrincipalComponent {
  title = 'inicio';
  content = 'welcome to ower principal page...'

  botonInfoHover = false;

  rutas: rutas[] = [
    //{ label: 'Inicio', route: 'inicio', exact: true },
    { label: 'Usuario', route: 'userinfo', exact: true }
  ];

}
