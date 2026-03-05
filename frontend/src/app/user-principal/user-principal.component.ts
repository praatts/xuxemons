import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

interface rutas {
  label: string;
  route: string;
  exact: boolean;
  img?: string;
}

@Component({
  selector: 'app-user-principal',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive, NgClass],
  templateUrl: './user-principal.component.html',
  styleUrl: './user-principal.component.css'
})
export class UserPrincipalComponent {

  nameValue = '';
  uidValue = '';
  displayNameVal = '';

  constructor(private userService: UserService, private router: Router) {
    this.userService.getUser().subscribe((u: any) => {
      this.nameValue = u.name || '';
      this.uidValue = u.player_id || '';
      this.displayNameVal = `${this.nameValue}${this.uidValue}`;
    });
  }

  darkMode = false;
  botonInfoHover = false;

  rutas: rutas[] = [
    //{ label: 'Inicio', route: 'inicio', exact: true, img: 'inicio.png' },
    { label: 'Usuario', route: 'userinfo', exact: true, img: 'user.png' },
    { label: 'xuxedex', route: 'xuxedex', exact: true, img: 'xuxedex.png' },
    { label: 'Motxilla', route: 'inventari', exact: true, img: 'inventari.png' },
  ];

  logout() {
    this.userService.logOut();
    this.router.navigate(['/']);
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
  }

}
